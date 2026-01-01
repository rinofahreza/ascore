import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import { read, utils, write } from 'xlsx';

export default function Index({ auth, cabangs, departemens, roles }) {
    // --- Tabs State ---
    const [activeTab, setActiveTab] = useState('single'); // 'single' or 'batch'

    // --- Single Mode State ---
    const { data: singleData, setData: setSingleData, post, processing: singleProcessing } = useForm({
        http_request: `GET /nik?nik=$nik HTTP/1.1
X-Rapidapi-Key: 0e94a518ebmshfd1957c3b41434cp13b537jsn336f7dbb9b85
X-Rapidapi-Host: cek-nik-ktp.p.rapidapi.com
Host: cek-nik-ktp.p.rapidapi.com`,
        nik: '',
    });
    const [singleResult, setSingleResult] = useState(null);
    const [singleLoading, setSingleLoading] = useState(false);
    const [showSingleSyncModal, setShowSingleSyncModal] = useState(false);
    const [singleSyncData, setSingleSyncData] = useState({
        cabang_id: '', departemen_id: '', role_id: '', status: '', is_active: 1, email: '', password: 'Asshofa2025!',
    });

    // --- Batch Mode State ---
    const [batchConfig, setBatchConfig] = useState({
        cabang_id: '', departemen_id: '', role_id: '', status: '', is_active: 1, password: 'Asshofa2025!',
    });
    const [batchNikInput, setBatchNikInput] = useState('');
    const [batchQueue, setBatchQueue] = useState([]); // Array of valid user objects ready to sync
    const [batchInvalidLog, setBatchInvalidLog] = useState([]); // Array of { nik, reason }
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchProcessStatus, setBatchProcessStatus] = useState(''); // Text status usually

    // --- Excel Mode State ---
    const [excelConfig, setExcelConfig] = useState({
        cabang_id: '', departemen_id: '', role_id: '', status: '', is_active: 1, password: 'Asshofa2025!',
    });
    const [excelProcessing, setExcelProcessing] = useState(false);

    // --- Common Helpers ---
    const getStatusOptions = (roleId) => {
        const selectedRole = roles.find(r => r.id == roleId);
        if (selectedRole && selectedRole.nama.toLowerCase() === 'siswa') {
            return ['Aktif'];
        }
        return ['Tetap', 'Percobaan', 'Kontrak', 'Mitra Kerja'];
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        dateStr = dateStr.trim();
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return null;
    };

    const toTitleCase = (str) => {
        if (!str) return null;
        return str.replace(/\w\S*/g, text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase());
    };

    const mapGender = (val) => {
        if (!val) return null;
        const v = val.toUpperCase().trim();
        if (v.includes('LAKI') || v === 'L' || v === 'PRIA' || v === 'MAN') return 'L';
        if (v.includes('PEREMPUAN') || v === 'P' || v === 'WANITA' || v === 'WOMEN') return 'P';
        return null;
    };

    const parseApiData = (apiResult, nik) => {
        const apiData = apiResult?.data?.data || {};
        let tempatLahir = apiData.TEMPAT_LAHIR || '';
        let tanggalLahirStr = apiData.TANGGAL_LAHIR || '';

        if (!tempatLahir && !tanggalLahirStr && apiData.TTL) {
            let parts = apiData.TTL.includes('/') ? apiData.TTL.split('/') : apiData.TTL.split(',');
            if (parts.length >= 2) {
                tempatLahir = parts[0].trim();
                tanggalLahirStr = parts[1].trim();
            }
        }

        const name = apiData.NAMA || apiData.NAMA_LENGKAP || 'Unknown Name';
        // Generate Email: nama + 4 digit unique code @asshofa.sch.id
        const namePart = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const uniqueCode = Math.floor(1000 + Math.random() * 9000);
        const email = `${namePart}${uniqueCode}@asshofa.sch.id`;

        return {
            nik: nik,
            nama: name,
            no_kk: apiData.NO_KK || apiData.NKK,
            tempat_lahir: tempatLahir,
            tanggal_lahir: formatDate(tanggalLahirStr),
            jenis_kelamin: mapGender(apiData.JENIS_KELAMIN || apiData.GENDER || apiData.SEX || apiData.JK),
            alamat: apiData.ALAMAT,
            rt_rw: apiData['RT/RW'] || apiData.RT_RW,
            kelurahan_desa: apiData.KEL_DESA || apiData.KELURAHAN,
            kecamatan: apiData.KECAMATAN,
            agama: toTitleCase(apiData.AGAMA),
            status_perkawinan: toTitleCase(apiData.STATUS_PERKAWINAN || apiData.STATUS_KAWIN || apiData.STAT_KWN || apiData.KAWIN),
            pekerjaan: apiData.PEKERJAAN,
            pendidikan_terakhir: apiData.PENDIDIKAN_TERAKHIR || apiData.PENDIDIKAN,
            kabupaten_kota: apiData['KABUPATEN/KOTA'] || apiData.KABUPATEN_KOTA || apiData.KABUPATEN || apiData.KOTA,
            provinsi: apiData.PROVINSI,
            email: email, // Generated email
        };
    };

    // --- Single Mode Handlers ---
    const handleSingleCheck = (e) => {
        e.preventDefault();
        setSingleLoading(true);
        setSingleResult(null);

        axios.post(route('api-nik.execute'), singleData)
            .then(response => {
                setSingleResult(response.data);
                setSingleLoading(false);
            })
            .catch(error => {
                setSingleResult(error.response?.data || { error: 'An error occurred' });
                setSingleLoading(false);
            });
    };

    const openSingleSyncModal = () => {
        let email = '';
        if (singleResult && singleResult.data && singleResult.data.data && singleResult.data.data.NAMA) {
            const namePart = singleResult.data.data.NAMA.toLowerCase().replace(/[^a-z0-9]/g, '');
            email = `${namePart}@asshofa.sch.id`;
        }
        setSingleSyncData({ ...singleSyncData, email: email });
        setShowSingleSyncModal(true);
    };

    const handleSingleSync = () => {
        if (!singleSyncData.role_id || !singleSyncData.cabang_id || !singleSyncData.email || !singleSyncData.password) {
            Swal.fire({ icon: 'error', title: 'Data Tidak Lengkap', text: 'Mohon lengkapi data wajib (Cabang, Peran, Email, Password)' });
            return;
        }

        const userData = parseApiData(singleResult, singleData.nik);
        // Override generated email with user input
        userData.email = singleSyncData.email;

        // Merge with config data
        const payload = { ...userData, ...singleSyncData };

        axios.post(route('api-nik.sync'), payload)
            .then(response => {
                setShowSingleSyncModal(false);
                setSingleSyncData({ cabang_id: '', departemen_id: '', role_id: '', status: '', is_active: 1, email: '', password: 'Asshofa2025!' });
                Swal.fire({
                    icon: 'success', title: 'Sinkronisasi Berhasil!', text: 'User baru telah berhasil disinkronisasi dan dibuat.',
                    showConfirmButton: true, confirmButtonText: 'Kembali ke Daftar Pengguna', timer: 3000, timerProgressBar: true
                }).then((r) => { if (r.isConfirmed || r.dismiss === Swal.DismissReason.timer) router.get(route('pengguna.index')); });
            })
            .catch(error => {
                const msg = error.response?.data?.message || error.response?.data?.error || 'Gagal melakukan sinkronisasi';
                Swal.fire({ icon: 'error', title: 'Sinkronisasi Gagal', text: msg });
            });
    };

    // --- Batch Mode Handlers ---
    const handleBatchCheck = async () => {
        if (!batchConfig.cabang_id || !batchConfig.role_id) {
            Swal.fire({ icon: 'warning', title: 'Konfigurasi Belum Lengkap', text: 'Harap set Cabang dan Peran terlebih dahulu di bagian atas.' });
            return;
        }
        if (!batchNikInput.trim()) return;

        setBatchLoading(true);

        // Split by comma or newline and filter empty
        const nikList = batchNikInput.split(/[\n,]+/).map(n => n.trim()).filter(n => n.length > 0);
        const total = nikList.length;

        let newQueue = [];
        let newInvalid = [];
        const template = singleData.http_request;

        for (let i = 0; i < total; i++) {
            const currentNik = nikList[i];
            setBatchProcessStatus(`Memproses ${i + 1} dari ${total} (${currentNik})...`);

            // Check if NIK already in queue or logs (including currently processed batch)
            const isDuplicate = batchQueue.some(q => q.nik === currentNik) ||
                batchInvalidLog.some(l => l.nik === currentNik) ||
                newQueue.some(q => q.nik === currentNik) ||
                newInvalid.some(l => l.nik === currentNik);

            if (isDuplicate) {
                newInvalid.push({ nik: currentNik, reason: 'Duplikat (sudah ada di antrian/log)' });
                continue;
            }

            try {
                const payload = {
                    http_request: template,
                    nik: currentNik
                };

                const response = await axios.post(route('api-nik.execute'), payload);

                if (response.data.status === 200 && response.data.data.data) {
                    const parsedUser = parseApiData(response.data, currentNik);
                    const fullUserData = {
                        ...parsedUser,
                        ...batchConfig,
                        email: parsedUser.email,
                    };
                    newQueue.push(fullUserData);
                } else {
                    newInvalid.push({ nik: currentNik, reason: 'Data tidak ditemukan di API' });
                }

            } catch (error) {
                newInvalid.push({ nik: currentNik, reason: error.response?.data?.error || 'Error connect API' });
            }
        }

        // Update State once
        setBatchQueue(prev => [...prev, ...newQueue]);
        setBatchInvalidLog(prev => [...prev, ...newInvalid]);
        setBatchNikInput('');
        setBatchLoading(false);
        setBatchProcessStatus(`Selesai. ${newQueue.length} Valid, ${newInvalid.length} Invalid.`);
    };

    const handleBatchSync = () => {
        if (batchQueue.length === 0) return;

        Swal.fire({
            title: 'Konfirmasi Simpan Masal',
            text: `Anda akan menyimpan ${batchQueue.length} data pengguna baru. Lanjutkan?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan Semua',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                setBatchLoading(true);
                setBatchProcessStatus('Menyimpan data ke database...');

                axios.post(route('api-nik.batch-sync'), { users: batchQueue })
                    .then(response => {
                        setBatchLoading(false);
                        if (response.data.errors && response.data.errors.length > 0) {
                            let errorMsg = response.data.errors.map(e => `${e.nik}: ${e.error}`).join('\n');
                            Swal.fire({
                                icon: 'warning',
                                title: 'Disimpan dengan Catatan',
                                text: `Berhasil: ${response.data.success_count}. Gagal: ${response.data.errors.length}.\nDetail Gagal:\n${errorMsg}`
                            });
                            setBatchQueue([]);
                            setBatchInvalidLog([]);
                        } else {
                            Swal.fire({
                                icon: 'success',
                                title: 'Sukses!',
                                text: `Berhasil menyimpan ${response.data.success_count} data pengguna.`,
                            }).then(() => {
                                router.get(route('pengguna.index'));
                            });
                        }
                    })
                    .catch(error => {
                        setBatchLoading(false);
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Menyimpan',
                            text: error.response?.data?.error || 'Terjadi kesalahan sistem.'
                        });
                    });
            }
        });
    };

    const removeFromQueue = (index) => {
        const newQueue = [...batchQueue];
        newQueue.splice(index, 1);
        setBatchQueue(newQueue);
    };

    // --- Excel Handlers ---
    const handleDownloadTemplate = () => {
        const wb = utils.book_new();
        // Define headers matching the database/model fields (Removed Email & Password)
        const headers = [
            'NIK', 'Nama',
            'No KK', 'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)', 'Jenis Kelamin (L/P)',
            'Alamat', 'RT/RW', 'Kelurahan', 'Kecamatan', 'Kabupaten/Kota', 'Provinsi',
            'Agama', 'Status Perkawinan', 'Pekerjaan', 'Pendidikan Terakhir'
        ];
        const exampleRow = [
            '1234567890123456', 'Budi Santoso',
            '3201234567890001', 'Jakarta', '1990-01-01', 'L',
            'Jl. Merdeka No. 1', '001/002', 'Gambir', 'Gambir', 'Jakarta Pusat', 'DKI Jakarta',
            'Islam', 'Belum Kawin', 'Guru', 'S1'
        ];

        const wsData = [headers, exampleRow];
        const ws = utils.aoa_to_sheet(wsData);

        // Adjust column widths
        ws['!cols'] = headers.map(() => ({ wch: 25 }));

        utils.book_append_sheet(wb, ws, "Template_Data_User");
        const filename = "Template_Import_Lengkap.xlsx";

        import('file-saver').then(module => {
            const excelBuffer = write(wb, { bookType: 'xlsx', type: 'array' });
            const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            module.default.saveAs(data, filename);
        });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!excelConfig.cabang_id || !excelConfig.role_id) {
            Swal.fire({ icon: 'warning', title: 'Konfigurasi Belum Lengkap', text: 'Harap set Cabang dan Peran terlebih dahulu di bagian atas.' });
            e.target.value = null;
            return;
        }

        setExcelProcessing(true);
        setBatchProcessStatus('Membaca file Excel...');

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];

            // Read as JSON with headers
            const jsonData = utils.sheet_to_json(ws, { defval: "" });

            if (jsonData.length === 0) {
                Swal.fire({ icon: 'warning', title: 'File Kosong', text: 'Tidak ada data ditemukan dalam file.' });
                setExcelProcessing(false);
                return;
            }

            // Filter rows with valid NIK
            const validRows = jsonData.filter(row => row['NIK'] && String(row['NIK']).trim().length >= 10);

            if (validRows.length === 0) {
                Swal.fire({ icon: 'warning', title: 'Data NIK Tidak Ditemukan', text: 'Pastikan file menggunakan template yang benar dan kolom NIK terisi.' });
                setExcelProcessing(false);
                return;
            }

            setBatchProcessStatus(`Ditemukan ${validRows.length} data valid. Memproses data...`);
            setActiveTab('batch');
            setBatchLoading(true);

            let newQueue = [];
            let newInvalid = [];
            // Remove API template reliance

            const total = validRows.length;

            for (let i = 0; i < total; i++) {
                const row = validRows[i];
                const currentNik = String(row['NIK']).trim();
                const nama = row['Nama'] || 'Tanpa Nama';

                // Duplicate Check in existing queue
                if (batchQueue.some(q => q.nik === currentNik) || newQueue.some(q => q.nik === currentNik)) {
                    newInvalid.push({ nik: currentNik, reason: 'Duplikat (sudah ada di antrian)' });
                    continue;
                }

                try {
                    // Start User Object Construction directly from Excel + Config

                    // Generate Email: nama + 4 digit unique code @asshofa.sch.id
                    const namePart = nama.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const uniqueCode = Math.floor(1000 + Math.random() * 9000);
                    const generatedEmail = `${namePart}${uniqueCode}@asshofa.sch.id`;

                    const userData = {
                        nik: currentNik,
                        nama: nama,
                        email: generatedEmail,

                        // Identity Map
                        no_kk: row['No KK'] || '',
                        tempat_lahir: row['Tempat Lahir'] || '',
                        tanggal_lahir: row['Tanggal Lahir (YYYY-MM-DD)'] || '', // Ensure format YYYY-MM-DD in excel or handle parsing if needed. passing string for now.
                        jenis_kelamin: row['Jenis Kelamin (L/P)'] || '',
                        alamat: row['Alamat'] || '',
                        rt_rw: row['RT/RW'] || '',
                        kelurahan_desa: row['Kelurahan'] || '',
                        kecamatan: row['Kecamatan'] || '',
                        kabupaten_kota: row['Kabupaten/Kota'] || '',
                        provinsi: row['Provinsi'] || '',
                        agama: row['Agama'] || '',
                        status_perkawinan: row['Status Perkawinan'] || '',
                        pekerjaan: row['Pekerjaan'] || '',
                        pendidikan_terakhir: row['Pendidikan Terakhir'] || '',

                        // Config fields from Global Excel Config
                        ...excelConfig,

                        // Explicitly set password from config (as header is removed)
                        password: excelConfig.password,
                    };

                    newQueue.push(userData);

                } catch (error) {
                    newInvalid.push({ nik: currentNik, reason: 'Gagal memproses baris Excel' });
                }
            }

            setBatchQueue(prev => [...prev, ...newQueue]);
            setBatchInvalidLog(prev => [...prev, ...newInvalid]);
            setBatchLoading(false);
            setBatchProcessStatus(`Import Selesai. ${newQueue.length} Valid, ${newInvalid.length} Invalid.`);
            setExcelProcessing(false);
        };
        reader.readAsBinaryString(file);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="API NIK" />

            <div className="py-6 pb-32">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Tabs Navigation */}
                    <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'single' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('single')}
                        >
                            Mode Single
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'batch' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('batch')}
                        >
                            Mode Masal (Manual)
                        </button>
                        <button
                            className={`py-2 px-4 font-medium text-sm focus:outline-none ${activeTab === 'excel' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                            onClick={() => setActiveTab('excel')}
                        >
                            Import Excel
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">

                        {/* ================= SINGLE MODE ================= */}
                        {activeTab === 'single' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Pencarian Tunggal</h3>
                                <form onSubmit={handleSingleCheck} className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="http_request" value="HTTP Request Template" />
                                        <textarea
                                            id="http_request"
                                            value={singleData.http_request}
                                            onChange={(e) => setSingleData('http_request', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm font-mono text-sm h-48"
                                            placeholder="Enter raw HTTP request..."
                                        />
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            Gunakan <code>$nik</code> sebagai variabel untuk disubstitusi dengan NIK yang diinputkan.
                                        </p>
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="nik" value="NIK Target ($nik)" />
                                        <TextInput
                                            id="nik"
                                            value={singleData.nik}
                                            onChange={(e) => setSingleData('nik', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Masukkan NIK"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-end space-x-3">
                                        <Link
                                            href={route('pengguna.index')}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-medium text-sm"
                                        >
                                            Kembali
                                        </Link>
                                        <PrimaryButton disabled={singleLoading || singleProcessing}>
                                            {singleLoading ? 'Processing...' : 'Execute Request'}
                                        </PrimaryButton>
                                    </div>
                                </form>

                                {/* Single Result */}
                                {singleResult && (
                                    <div className="mt-8 border-t pt-6 dark:border-gray-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className={`text-lg font-medium ${singleResult.status === 200 ? 'text-green-600' : 'text-red-600'}`}>
                                                {singleResult.status === 200 ? 'Data Ditemukan' : `Error: ${singleResult.status}`}
                                            </div>
                                            {singleResult.status === 200 && singleResult.data && singleResult.data.data && (
                                                <PrimaryButton onClick={openSingleSyncModal} className="bg-green-600 hover:bg-green-700">
                                                    Sinkronkan Data Ini
                                                </PrimaryButton>
                                            )}
                                        </div>

                                        {singleResult.data && singleResult.data.data ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(singleResult.data.data).flatMap(([key, value]) => {
                                                    if (key === 'TTL' && value && value.includes('/')) {
                                                        const [tempat, tanggal] = value.split('/').map(s => s.trim());
                                                        return [
                                                            <div key="TEMPAT_LAHIR">
                                                                <InputLabel htmlFor="TEMPAT_LAHIR" value="TEMPAT LAHIR" />
                                                                <TextInput
                                                                    id="TEMPAT_LAHIR"
                                                                    value={tempat || ''}
                                                                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-800"
                                                                    readOnly
                                                                />
                                                            </div>,
                                                            <div key="TANGGAL_LAHIR">
                                                                <InputLabel htmlFor="TANGGAL_LAHIR" value="TANGGAL LAHIR" />
                                                                <TextInput
                                                                    id="TANGGAL_LAHIR"
                                                                    value={tanggal || ''}
                                                                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-800"
                                                                    readOnly
                                                                />
                                                            </div>
                                                        ];
                                                    }
                                                    return (
                                                        <div key={key}>
                                                            <InputLabel htmlFor={key} value={key.replace(/_/g, ' ')} />
                                                            <TextInput
                                                                id={key}
                                                                value={value || ''}
                                                                className="mt-1 block w-full bg-gray-50 dark:bg-gray-800"
                                                                readOnly
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                                                <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                                    {JSON.stringify(singleResult, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}


                        {/* ================= BATCH MODE ================= */}
                        {activeTab === 'batch' && (
                            <div className="space-y-8">
                                {/* 1. Global Configuration */}
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-md font-semibold text-blue-900 dark:text-blue-200 mb-3">1. Konfigurasi Global (Set Awal)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel value="Cabang" />
                                            <select value={batchConfig.cabang_id} onChange={e => setBatchConfig({ ...batchConfig, cabang_id: e.target.value })} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                <option value="">Pilih Cabang</option>
                                                {cabangs.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Departemen" />
                                            <select value={batchConfig.departemen_id} onChange={e => setBatchConfig({ ...batchConfig, departemen_id: e.target.value })} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                <option value="">Pilih Departemen</option>
                                                {departemens.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Peran" />
                                            <select
                                                value={batchConfig.role_id}
                                                onChange={e => {
                                                    const newRole = e.target.value;
                                                    const roleObj = roles.find(r => r.id == newRole);
                                                    const status = (roleObj && roleObj.nama.toLowerCase() === 'siswa') ? 'Aktif' : 'Tetap';
                                                    setBatchConfig({ ...batchConfig, role_id: newRole, status: status });
                                                }}
                                                className="block w-full border-gray-300 dark:bg-gray-700 rounded-md"
                                            >
                                                <option value="">Pilih Peran</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Status" />
                                            <select value={batchConfig.status} onChange={e => setBatchConfig({ ...batchConfig, status: e.target.value })} disabled={!batchConfig.role_id} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                {getStatusOptions(batchConfig.role_id).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Password Default" />
                                            <TextInput value={batchConfig.password} onChange={e => setBatchConfig({ ...batchConfig, password: e.target.value })} className="block w-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Input NIK & Check */}
                                <div>
                                    <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">2. Input NIK & Cek</h3>
                                    <div className="flex gap-2 items-start">
                                        <div className="w-full md:w-2/3">
                                            <textarea
                                                value={batchNikInput}
                                                onChange={e => setBatchNikInput(e.target.value)}
                                                className="block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                                rows={6}
                                                placeholder="Masukkan NIK (bisa banyak, pisahkan dengan koma atau baris baru)"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Contoh: 1234567890123456, 9876543210987654</p>
                                        </div>
                                        <SecondaryButton onClick={handleBatchCheck} disabled={batchLoading} className="h-10 mt-0.5">
                                            {batchLoading ? (
                                                <div className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Proses...
                                                </div>
                                            ) : 'Cek NIK'}
                                        </SecondaryButton>
                                    </div>
                                    {batchLoading && (
                                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 animate-pulse">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    )}
                                    {batchProcessStatus && <p className="text-sm text-indigo-600 font-medium mt-1">{batchProcessStatus}</p>}
                                </div>

                                {/* 3. Queue Tables */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-bold text-green-700">Antrian Sinkronisasi ({batchQueue.length})</h4>
                                            <PrimaryButton onClick={handleBatchSync} disabled={batchQueue.length === 0 || batchLoading} className="bg-green-600 hover:bg-green-700">
                                                Simpan Masal ({batchQueue.length})
                                            </PrimaryButton>
                                        </div>
                                        <div className="bg-white border rounded-lg overflow-hidden h-96 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-10">No</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIK</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email (Auto)</th>
                                                        <th className="px-4 py-2 text-right">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {batchQueue.length === 0 ? (
                                                        <tr><td colSpan="5" className="px-4 py-4 text-center text-gray-500">Belum ada data antrian.</td></tr>
                                                    ) : (
                                                        batchQueue.map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.nik}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.nama}</td>
                                                                <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{item.email}</td>
                                                                <td className="px-4 py-2 text-right">
                                                                    <button onClick={() => removeFromQueue(idx)} className="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-red-700 mb-2">Log Invalid ({batchInvalidLog.length})</h4>
                                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-lg p-4 h-96 overflow-y-auto">
                                            {batchInvalidLog.length === 0 ? (
                                                <p className="text-sm text-gray-500">Log kosong.</p>
                                            ) : (
                                                <ul className="space-y-2">
                                                    {batchInvalidLog.map((log, idx) => (
                                                        <li key={idx} className="text-sm border-b border-red-100 pb-1">
                                                            <span className="font-mono font-bold text-red-800 dark:text-red-300">{log.nik}</span>
                                                            <br />
                                                            <span className="text-red-600 dark:text-red-400 text-xs">{log.reason}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= EXCEL MODE ================= */}
                        {activeTab === 'excel' && (
                            <div className="space-y-8">
                                {/* 1. Global Configuration (Similar to Batch) */}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <h3 className="text-md font-semibold text-green-900 dark:text-green-200 mb-3">1. Konfigurasi Global (Untuk Semua Data Excel)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <InputLabel value="Cabang" />
                                            <select value={excelConfig.cabang_id} onChange={e => setExcelConfig({ ...excelConfig, cabang_id: e.target.value })} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                <option value="">Pilih Cabang</option>
                                                {cabangs.map(c => <option key={c.id} value={c.id}>{c.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Departemen" />
                                            <select value={excelConfig.departemen_id} onChange={e => setExcelConfig({ ...excelConfig, departemen_id: e.target.value })} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                <option value="">Pilih Departemen</option>
                                                {departemens.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Peran" />
                                            <select
                                                value={excelConfig.role_id}
                                                onChange={e => {
                                                    const newRole = e.target.value;
                                                    const roleObj = roles.find(r => r.id == newRole);
                                                    const status = (roleObj && roleObj.nama.toLowerCase() === 'siswa') ? 'Aktif' : 'Tetap';
                                                    setExcelConfig({ ...excelConfig, role_id: newRole, status: status });
                                                }}
                                                className="block w-full border-gray-300 dark:bg-gray-700 rounded-md"
                                            >
                                                <option value="">Pilih Peran</option>
                                                {roles.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Status" />
                                            <select value={excelConfig.status} onChange={e => setExcelConfig({ ...excelConfig, status: e.target.value })} disabled={!excelConfig.role_id} className="block w-full border-gray-300 dark:bg-gray-700 rounded-md">
                                                {getStatusOptions(excelConfig.role_id).map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <InputLabel value="Password Default" />
                                            <TextInput value={excelConfig.password} onChange={e => setExcelConfig({ ...excelConfig, password: e.target.value })} className="block w-full" />
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Download Template & Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                                        <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Langkah 1: Download Template</h4>
                                        <p className="text-sm text-gray-500 mb-4 text-center">Unduh template Excel yang berisi kolom NIK.</p>
                                        <SecondaryButton onClick={handleDownloadTemplate}>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                            Download Template .xlsx
                                        </SecondaryButton>
                                    </div>

                                    <div className="p-6 border-2 border-dashed border-indigo-300 rounded-lg flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/20">
                                        <h4 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-2">Langkah 2: Upload Excel</h4>
                                        <p className="text-sm text-gray-500 mb-4 text-center">Upload file yang sudah diisi NIK-nya. Konfigurasi Cabang dll akan diambil dari form di atas.</p>

                                        <input
                                            type="file"
                                            id="excel_upload"
                                            accept=".xlsx, .xls"
                                            onChange={handleFileUpload}
                                            disabled={excelProcessing}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="excel_upload"
                                            className={`cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150 ${excelProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {excelProcessing ? 'Memproses...' : 'Pilih File Excel & Proses'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Link href={route('pengguna.index')} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 underline text-sm">
                                Kembali ke Daftar Pengguna
                            </Link>
                        </div>

                    </div>
                </div>
            </div>

            {/* Single Sync Modal Reuse */}
            <Modal show={showSingleSyncModal} onClose={() => setShowSingleSyncModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Sinkronkan Data (Single)</h2>
                    <div className="mt-4 grid grid-cols-1 gap-4">
                        <div>
                            <InputLabel htmlFor="cabang_id" value="Cabang" />
                            <select
                                id="cabang_id"
                                value={singleSyncData.cabang_id}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, cabang_id: e.target.value })}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            >
                                <option value="">Pilih Cabang</option>
                                {cabangs.map((c) => (
                                    <option key={c.id} value={c.id}>{c.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="departemen_id" value="Departemen" />
                            <select
                                id="departemen_id"
                                value={singleSyncData.departemen_id}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, departemen_id: e.target.value })}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            >
                                <option value="">Pilih Departemen</option>
                                {departemens.map((d) => (
                                    <option key={d.id} value={d.id}>{d.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="role_id" value="Peran" />
                            <select
                                id="role_id"
                                value={singleSyncData.role_id}
                                onChange={(e) => {
                                    const roleId = e.target.value;
                                    const selectedRole = roles.find(r => r.id == roleId);
                                    let defaultStatus = 'Tetap';
                                    if (selectedRole && selectedRole.nama.toLowerCase() === 'siswa') {
                                        defaultStatus = 'Aktif';
                                    }
                                    setSingleSyncData({ ...singleSyncData, role_id: roleId, status: defaultStatus });
                                }}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            >
                                <option value="">Pilih Peran</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id}>{r.nama}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                value={singleSyncData.status}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, status: e.target.value })}
                                disabled={!singleSyncData.role_id}
                                className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                            >
                                {getStatusOptions(singleSyncData.role_id).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email (Login Username)" />
                            <TextInput
                                id="email"
                                value={singleSyncData.email}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, email: e.target.value })}
                                className="mt-1 block w-full"
                                placeholder="Email Generated"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password Default" />
                            <TextInput
                                id="password"
                                value={singleSyncData.password}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, password: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={singleSyncData.is_active == 1}
                                onChange={(e) => setSingleSyncData({ ...singleSyncData, is_active: e.target.checked ? 1 : 0 })}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                Aktif?
                            </label>
                        </div>

                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                        <SecondaryButton onClick={() => setShowSingleSyncModal(false)}>Batal</SecondaryButton>
                        <PrimaryButton onClick={handleSingleSync}>Simpan</PrimaryButton>
                    </div>
                </div>
            </Modal>

        </AuthenticatedLayout>
    );
}
