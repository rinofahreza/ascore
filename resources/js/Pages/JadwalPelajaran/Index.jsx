import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, jadwals, cabangs, periodeAkademiks, activePeriode, filters, jamPelajarans }) {
    const { props } = usePage();
    const flash = props.flash || {};
    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    // Flash message state
    const [showFlash, setShowFlash] = useState(false);

    // Sync results state for visual indicators
    const [syncResults, setSyncResults] = useState({
        success: [],
        skipped: []
    });

    // Show flash message on mount if exists
    useEffect(() => {
        if (flash.success || flash.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Handle sync results for visual indicators
    useEffect(() => {
        if (flash.sync_results) {
            setSyncResults({
                success: flash.sync_results.success || [],
                skipped: flash.sync_results.skipped || []
            });
            // Auto-clear after 10 seconds
            const timer = setTimeout(() => {
                setSyncResults({ success: [], skipped: [] });
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [flash.sync_results]);

    // Filter states
    const [filterPeriode, setFilterPeriode] = useState(filters?.periode_akademik_id || activePeriode?.id || '');
    const [filterCabang, setFilterCabang] = useState(filters?.cabang_id || '');
    const [filterDepartemen, setFilterDepartemen] = useState(filters?.departemen_id || '');
    const [filterHari, setFilterHari] = useState(filters?.hari || '');
    const [filterKelas, setFilterKelas] = useState(filters?.kelas_id || '');
    const [filterMataPelajaran, setFilterMataPelajaran] = useState(filters?.mata_pelajaran_id || '');
    const [filterGuru, setFilterGuru] = useState(filters?.guru_id || '');

    // Filter dropdown options
    const [departemens, setDepartemens] = useState([]);
    const [kelass, setKelass] = useState([]);
    const [mataPelajarans, setMataPelajarans] = useState([]);
    const [gurus, setGurus] = useState([]);

    // BATCH SAVE STATES
    const [newRows, setNewRows] = useState([]);
    const [editedRows, setEditedRows] = useState({});
    const [deletedIds, setDeletedIds] = useState([]);
    const [editingIds, setEditingIds] = useState([]);

    // Cascading dropdown states for new rows (indexed by temp ID)
    const [newRowsDropdowns, setNewRowsDropdowns] = useState({});

    // Cascading dropdown states for edited rows (indexed by real ID)
    const [editRowsDropdowns, setEditRowsDropdowns] = useState({});

    // Delete confirmation
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        action: null, // 'delete' or 'cancel-all'
        data: null
    });

    // Processing states
    const [saving, setSaving] = useState(false);

    // Counter for temporary IDs
    const [tempIdCounter, setTempIdCounter] = useState(1);

    // Check if any filter is applied
    const hasFilters = filterCabang || filterDepartemen || filterHari || filterKelas || filterMataPelajaran || filterGuru;

    // Fetch filter departemen
    useEffect(() => {
        if (filterCabang) {
            axios.get(route('api.departemen.by-cabang', filterCabang))
                .then(response => setDepartemens(response.data))
                .catch(error => console.error('Error:', error));
        } else {
            setDepartemens([]);
            setFilterDepartemen('');
        }
    }, [filterCabang]);

    // Fetch filter kelas, mata pelajaran, guru
    useEffect(() => {
        if (filterDepartemen) {
            axios.get(route('api.kelas.by-departemen', filterDepartemen))
                .then(response => setKelass(response.data));
            axios.get(route('api.mata-pelajaran.by-departemen', filterDepartemen))
                .then(response => setMataPelajarans(response.data));
            axios.get(route('api.guru.by-departemen', filterDepartemen))
                .then(response => setGurus(response.data));
        } else {
            setKelass([]);
            setMataPelajarans([]);
            setGurus([]);
        }
    }, [filterDepartemen]);

    // Fetch cascading dropdowns for new rows
    useEffect(() => {
        newRows.forEach(row => {
            const tempId = row.tempId;

            // Fetch departemen
            if (row.cabang_id && !newRowsDropdowns[tempId]?.departemens) {
                axios.get(route('api.departemen.by-cabang', row.cabang_id))
                    .then(response => {
                        setNewRowsDropdowns(prev => ({
                            ...prev,
                            [tempId]: { ...prev[tempId], departemens: response.data }
                        }));
                    });
            }

            // Fetch kelas, mata pelajaran, guru
            if (row.departemen_id) {
                if (!newRowsDropdowns[tempId]?.kelass) {
                    axios.get(route('api.kelas.by-departemen', row.departemen_id))
                        .then(response => {
                            setNewRowsDropdowns(prev => ({
                                ...prev,
                                [tempId]: { ...prev[tempId], kelass: response.data }
                            }));
                        });
                }
                if (!newRowsDropdowns[tempId]?.mataPelajarans) {
                    axios.get(route('api.mata-pelajaran.by-departemen', row.departemen_id))
                        .then(response => {
                            setNewRowsDropdowns(prev => ({
                                ...prev,
                                [tempId]: { ...prev[tempId], mataPelajarans: response.data }
                            }));
                        });
                }
                if (!newRowsDropdowns[tempId]?.gurus) {
                    axios.get(route('api.guru.by-departemen', row.departemen_id))
                        .then(response => {
                            setNewRowsDropdowns(prev => ({
                                ...prev,
                                [tempId]: { ...prev[tempId], gurus: response.data }
                            }));
                        });
                }
            }
        });
    }, [newRows]);

    // Fetch cascading dropdowns for edited rows
    useEffect(() => {
        Object.entries(editedRows).forEach(([id, row]) => {
            // Fetch departemen
            if (row.cabang_id && !editRowsDropdowns[id]?.departemens) {
                axios.get(route('api.departemen.by-cabang', row.cabang_id))
                    .then(response => {
                        setEditRowsDropdowns(prev => ({
                            ...prev,
                            [id]: { ...prev[id], departemens: response.data }
                        }));
                    });
            }

            // Fetch kelas, mata pelajaran, guru
            if (row.departemen_id) {
                if (!editRowsDropdowns[id]?.kelass) {
                    axios.get(route('api.kelas.by-departemen', row.departemen_id))
                        .then(response => {
                            setEditRowsDropdowns(prev => ({
                                ...prev,
                                [id]: { ...prev[id], kelass: response.data }
                            }));
                        });
                }
                if (!editRowsDropdowns[id]?.mataPelajarans) {
                    axios.get(route('api.mata-pelajaran.by-departemen', row.departemen_id))
                        .then(response => {
                            setEditRowsDropdowns(prev => ({
                                ...prev,
                                [id]: { ...prev[id], mataPelajarans: response.data }
                            }));
                        });
                }
                if (!editRowsDropdowns[id]?.gurus) {
                    axios.get(route('api.guru.by-departemen', row.departemen_id))
                        .then(response => {
                            setEditRowsDropdowns(prev => ({
                                ...prev,
                                [id]: { ...prev[id], gurus: response.data }
                            }));
                        });
                }
            }
        });
    }, [editedRows]);

    // Apply filters
    const applyFilters = () => {
        router.get(route('jadwal-pelajaran.index'), {
            periode_akademik_id: filterPeriode,
            cabang_id: filterCabang,
            departemen_id: filterDepartemen,
            hari: filterHari,
            kelas_id: filterKelas,
            mata_pelajaran_id: filterMataPelajaran,
            guru_id: filterGuru,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Clear filters
    const clearFilters = () => {
        setFilterPeriode(activePeriode?.id || '');
        setFilterCabang('');
        setFilterDepartemen('');
        setFilterHari('');
        setFilterKelas('');
        setFilterMataPelajaran('');
        setFilterGuru('');
        router.get(route('jadwal-pelajaran.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Add new row
    const handleAddRow = () => {
        const tempId = `temp_${tempIdCounter}`;
        setTempIdCounter(tempIdCounter + 1);

        setNewRows([...newRows, {
            tempId,
            periode_akademik_id: activePeriode?.id || '',
            cabang_id: '',
            departemen_id: '',
            hari: '',
            kelas_id: '',
            mata_pelajaran_id: '',
            jam_pelajaran_id: '',
            guru_id: '',
        }]);
    };

    // Remove new row
    const handleRemoveNewRow = (tempId) => {
        setNewRows(newRows.filter(row => row.tempId !== tempId));
        // Clean up dropdowns
        const { [tempId]: removed, ...rest } = newRowsDropdowns;
        setNewRowsDropdowns(rest);
    };

    // Update new row data
    const handleUpdateNewRow = (tempId, field, value) => {
        setNewRows(newRows.map(row => {
            if (row.tempId === tempId) {
                const updated = { ...row, [field]: value };

                // Reset dependent fields
                if (field === 'cabang_id') {
                    updated.departemen_id = '';
                    updated.kelas_id = '';
                    updated.mata_pelajaran_id = '';
                    updated.guru_id = '';
                    updated.jam_pelajaran_id = '';
                    // Clear dropdowns
                    setNewRowsDropdowns(prev => ({
                        ...prev,
                        [tempId]: {}
                    }));
                } else if (field === 'departemen_id') {
                    updated.kelas_id = '';
                    updated.mata_pelajaran_id = '';
                    updated.guru_id = '';
                    updated.jam_pelajaran_id = '';
                }

                return updated;
            }
            return row;
        }));
    };

    // Start editing
    const handleEdit = (jadwal) => {
        setEditingIds([...editingIds, jadwal.id]);
        setEditedRows({
            ...editedRows,
            [jadwal.id]: {
                id: jadwal.id,
                periode_akademik_id: jadwal.periode_akademik_id,
                cabang_id: jadwal.cabang_id,
                departemen_id: jadwal.departemen_id,
                hari: jadwal.hari,
                kelas_id: jadwal.kelas_id,
                mata_pelajaran_id: jadwal.mata_pelajaran_id,
                jam_pelajaran_id: jadwal.jam_pelajaran_id,
                guru_id: jadwal.guru_id,
            }
        });
    };

    // Cancel editing
    const handleCancelEdit = (id) => {
        setEditingIds(editingIds.filter(editId => editId !== id));
        const { [id]: removed, ...rest } = editedRows;
        setEditedRows(rest);
        // Clean up dropdowns
        const { [id]: removedDropdowns, ...restDropdowns } = editRowsDropdowns;
        setEditRowsDropdowns(restDropdowns);
    };

    // Update edited row data
    const handleUpdateEditedRow = (id, field, value) => {
        setEditedRows({
            ...editedRows,
            [id]: {
                ...editedRows[id],
                [field]: value
            }
        });

        // Reset dependent fields
        if (field === 'cabang_id') {
            setEditedRows({
                ...editedRows,
                [id]: {
                    ...editedRows[id],
                    cabang_id: value,
                    departemen_id: '',
                    kelas_id: '',
                    mata_pelajaran_id: '',
                    guru_id: '',
                    jam_pelajaran_id: ''
                }
            });
            setEditRowsDropdowns(prev => ({
                ...prev,
                [id]: {}
            }));
        } else if (field === 'departemen_id') {
            setEditedRows({
                ...editedRows,
                [id]: {
                    ...editedRows[id],
                    departemen_id: value,
                    kelas_id: '',
                    mata_pelajaran_id: '',
                    guru_id: '',
                    jam_pelajaran_id: ''
                }
            });
        }
    };

    // Mark for deletion
    const handleMarkDelete = (id, jadwalInfo) => {
        setConfirmDialog({
            isOpen: true,
            action: 'delete',
            data: { id, jadwalInfo }
        });
    };

    const confirmDelete = () => {
        const { id } = confirmDialog.data;
        setDeletedIds([...deletedIds, id]);
        setConfirmDialog({ isOpen: false, action: null, data: null });
    };



    // Undo deletion
    const handleUndoDelete = (id) => {
        setDeletedIds(deletedIds.filter(deletedId => deletedId !== id));
    };

    // Save all changes
    const handleSaveAll = () => {
        setSaving(true);

        const payload = {
            new: newRows.map(({ tempId, ...row }) => row),
            edited: Object.values(editedRows),
            deleted: deletedIds
        };

        router.post(route('jadwal-pelajaran.batch-save'), payload, {
            onSuccess: () => {
                setNewRows([]);
                setEditedRows({});
                setDeletedIds([]);
                setEditingIds([]);
                setNewRowsDropdowns({});
                setEditRowsDropdowns({});
                setSaving(false);
            },
            onError: () => {
                setSaving(false);
            }
        });
    };

    // Cancel all changes
    const handleCancelAll = () => {
        setConfirmDialog({
            isOpen: true,
            action: 'cancel-all',
            data: null
        });
    };

    const confirmCancelAll = () => {
        setNewRows([]);
        setEditedRows({});
        setDeletedIds([]);
        setEditingIds([]);
        setNewRowsDropdowns({});
        setEditRowsDropdowns({});
        setConfirmDialog({ isOpen: false, action: null, data: null });
    };

    // Get filtered jam pelajaran
    const getFilteredJamPelajaran = (cabangId, departemenId, hari) => {
        return jamPelajarans.filter(jam => {
            const matchCabang = cabangId ? jam.cabang_id == cabangId : true;
            const matchDepartemen = departemenId ? jam.departemen_id == departemenId : true;
            const matchHari = hari ? jam.hari === hari : true;
            return matchCabang && matchDepartemen && matchHari;
        });
    };

    // Calculate pending changes count
    const pendingChangesCount = newRows.length + Object.keys(editedRows).length + deletedIds.length;
    const hasPendingChanges = pendingChangesCount > 0;

    return (
        <AuthenticatedLayout
            user={auth.user}
            forceMenu={true}
        >
            <Head title="Jadwal Pelajaran" />

            {/* Flash Messages */}
            {showFlash && (flash.success || flash.error) && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                    <div className={`max-w-md rounded-lg shadow-lg p-4 ${flash.success
                        ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                        }`}>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                {flash.success ? (
                                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <p className={`text-sm font-medium ${flash.success
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-red-800 dark:text-red-200'
                                    }`}>
                                    {flash.success || flash.error}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFlash(false)}
                                className={`ml-3 inline-flex rounded-md p-1.5 focus:outline-none ${flash.success
                                    ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-800'
                                    : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-800'
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className={`py-12 ${hasPendingChanges ? 'pb-64' : 'pb-32'}`}>
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filter Section */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter Data</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <select
                                        value={filterPeriode}
                                        onChange={(e) => setFilterPeriode(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                    >
                                        <option value="">Semua Periode</option>
                                        {periodeAkademiks.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nama}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterCabang}
                                        onChange={(e) => setFilterCabang(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                    >
                                        <option value="">Semua Cabang</option>
                                        {cabangs.map((c) => (
                                            <option key={c.id} value={c.id}>{c.nama}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterDepartemen}
                                        onChange={(e) => setFilterDepartemen(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                        disabled={!filterCabang}
                                    >
                                        <option value="">Semua Departemen</option>
                                        {departemens.map((d) => (
                                            <option key={d.id} value={d.id}>{d.nama}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterHari}
                                        onChange={(e) => setFilterHari(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                    >
                                        <option value="">Semua Hari</option>
                                        {hariOptions.map((h) => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterKelas}
                                        onChange={(e) => setFilterKelas(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                        disabled={!filterDepartemen}
                                    >
                                        <option value="">Semua Kelas</option>
                                        {kelass.map((k) => (
                                            <option key={k.id} value={k.id}>{k.nama}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterMataPelajaran}
                                        onChange={(e) => setFilterMataPelajaran(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                        disabled={!filterDepartemen}
                                    >
                                        <option value="">Semua Mata Pelajaran</option>
                                        {mataPelajarans.map((m) => (
                                            <option key={m.id} value={m.id}>{m.nama}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={filterGuru}
                                        onChange={(e) => setFilterGuru(e.target.value)}
                                        className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md"
                                        disabled={!filterDepartemen}
                                    >
                                        <option value="">Semua Guru</option>
                                        {gurus.map((g) => (
                                            <option key={g.id} value={g.id}>{g.name || '-'}</option>
                                        ))}
                                    </select>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={applyFilters}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
                                        >
                                            Terapkan
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-400"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Add Row Button */}
                            {hasPermission('jadwal_pelajaran.create') && (
                                <div className="mb-4">
                                    <button
                                        onClick={handleAddRow}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Tambah Baris</span>
                                    </button>
                                </div>
                            )}

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cabang</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Departemen</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hari</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kelas</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Mata Pelajaran</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Jam</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Guru</th>
                                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {/* Existing Rows */}
                                        {jadwals.data.length === 0 && newRows.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                    Belum ada data jadwal pelajaran
                                                </td>
                                            </tr>
                                        ) : (
                                            jadwals.data.map((jadwal) => {
                                                const isEditing = editingIds.includes(jadwal.id);
                                                const isDeleted = deletedIds.includes(jadwal.id);
                                                const editData = editedRows[jadwal.id];
                                                const dropdowns = editRowsDropdowns[jadwal.id] || {};

                                                if (isEditing) {
                                                    // Edit Mode
                                                    return (
                                                        <tr key={jadwal.id} className="bg-yellow-50 dark:bg-yellow-900/20">
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.cabang_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'cabang_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {cabangs.map((c) => (
                                                                        <option key={c.id} value={c.id}>{c.nama}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.departemen_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'departemen_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {(dropdowns.departemens || []).map((d) => (
                                                                        <option key={d.id} value={d.id}>{d.nama}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.hari}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'hari', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {hariOptions.map((h) => (
                                                                        <option key={h} value={h}>{h}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.kelas_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'kelas_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {(dropdowns.kelass || []).map((k) => (
                                                                        <option key={k.id} value={k.id}>{k.nama}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.mata_pelajaran_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'mata_pelajaran_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {(dropdowns.mataPelajarans || []).map((m) => (
                                                                        <option key={m.id} value={m.id}>{m.nama}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.jam_pelajaran_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'jam_pelajaran_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {getFilteredJamPelajaran(editData.cabang_id, editData.departemen_id, editData.hari).map((j) => (
                                                                        <option key={j.id} value={j.id}>{j.nama} ({j.jam_mulai}-{j.jam_selesai})</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <select
                                                                    value={editData.guru_id}
                                                                    onChange={(e) => handleUpdateEditedRow(jadwal.id, 'guru_id', e.target.value)}
                                                                    className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                                >
                                                                    {(dropdowns.gurus || []).map((g) => (
                                                                        <option key={g.id} value={g.id}>{g.name || '-'}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                            <td className="px-3 py-2 text-right">
                                                                <button
                                                                    onClick={() => handleCancelEdit(jadwal.id)}
                                                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                                >
                                                                    Batal
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                } else {
                                                    // View Mode
                                                    const isSuccess = syncResults.success.includes(jadwal.id);
                                                    const isSkipped = syncResults.skipped.includes(jadwal.id);

                                                    let rowClass = "";
                                                    if (isDeleted) {
                                                        rowClass = "bg-red-50 dark:bg-red-900/20 line-through opacity-50";
                                                    } else if (isSuccess) {
                                                        rowClass = "bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500";
                                                    } else if (isSkipped) {
                                                        rowClass = "bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500";
                                                    }

                                                    return (
                                                        <tr key={jadwal.id} className={rowClass}>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.cabang?.nama}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.departemen?.nama || '-'}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.hari}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.kelas?.nama}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.mata_pelajaran?.nama}</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.jam_pelajaran?.nama} ({jadwal.jam_pelajaran?.jam_mulai}-{jadwal.jam_pelajaran?.jam_selesai})</td>
                                                            <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">{jadwal.guru?.user?.name}</td>
                                                            <td className="px-3 py-2 text-right">
                                                                <div className="flex items-center justify-end space-x-1">
                                                                    {/* Sync Status Badge */}
                                                                    {isSuccess && (
                                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs rounded-full flex items-center space-x-1">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>Tersinkron</span>
                                                                        </span>
                                                                    )}
                                                                    {isSkipped && (
                                                                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 text-xs rounded-full flex items-center space-x-1">
                                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                            </svg>
                                                                            <span>Sudah Ada</span>
                                                                        </span>
                                                                    )}

                                                                    {/* Action Buttons */}
                                                                    {isDeleted ? (
                                                                        hasPermission('jadwal_pelajaran.delete') && (
                                                                            <button
                                                                                onClick={() => handleUndoDelete(jadwal.id)}
                                                                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                                                            >
                                                                                Undo
                                                                            </button>
                                                                        )
                                                                    ) : (
                                                                        <>
                                                                            {hasPermission('jadwal_pelajaran.edit') && (
                                                                                <button
                                                                                    onClick={() => handleEdit(jadwal)}
                                                                                    className="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                            )}
                                                                            {hasPermission('jadwal_pelajaran.delete') && (
                                                                                <button
                                                                                    onClick={() => handleMarkDelete(jadwal.id, `${jadwal.hari} - ${jadwal.kelas?.nama} - ${jadwal.mata_pelajaran?.nama}`)}
                                                                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                                                >
                                                                                    Hapus
                                                                                </button>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            })
                                        )}

                                        {/* New Rows */}
                                        {newRows.map((row) => {
                                            const dropdowns = newRowsDropdowns[row.tempId] || {};
                                            return (
                                                <tr key={row.tempId} className="bg-green-50 dark:bg-green-900/20">
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.cabang_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'cabang_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                        >
                                                            <option value="">Pilih</option>
                                                            {cabangs.map((c) => (
                                                                <option key={c.id} value={c.id}>{c.nama}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.departemen_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'departemen_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                            disabled={!row.cabang_id}
                                                        >
                                                            <option value="">Pilih</option>
                                                            {(dropdowns.departemens || []).map((d) => (
                                                                <option key={d.id} value={d.id}>{d.nama}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.hari}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'hari', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                        >
                                                            <option value="">Pilih</option>
                                                            {hariOptions.map((h) => (
                                                                <option key={h} value={h}>{h}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.kelas_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'kelas_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                            disabled={!row.departemen_id}
                                                        >
                                                            <option value="">Pilih</option>
                                                            {(dropdowns.kelass || []).map((k) => (
                                                                <option key={k.id} value={k.id}>{k.nama}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.mata_pelajaran_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'mata_pelajaran_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                            disabled={!row.departemen_id}
                                                        >
                                                            <option value="">Pilih</option>
                                                            {(dropdowns.mataPelajarans || []).map((m) => (
                                                                <option key={m.id} value={m.id}>{m.nama}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.jam_pelajaran_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'jam_pelajaran_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                            disabled={!row.hari}
                                                        >
                                                            <option value="">Pilih</option>
                                                            {getFilteredJamPelajaran(row.cabang_id, row.departemen_id, row.hari).map((j) => (
                                                                <option key={j.id} value={j.id}>{j.nama} ({j.jam_mulai}-{j.jam_selesai})</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <select
                                                            value={row.guru_id}
                                                            onChange={(e) => handleUpdateNewRow(row.tempId, 'guru_id', e.target.value)}
                                                            className="w-full text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                                                            disabled={!row.departemen_id}
                                                        >
                                                            <option value="">Pilih</option>
                                                            {(dropdowns.gurus || []).map((g) => (
                                                                <option key={g.id} value={g.id}>{g.name || '-'}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-2 text-right">
                                                        <button
                                                            onClick={() => handleRemoveNewRow(row.tempId)}
                                                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                            title="Hapus baris"
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {jadwals.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Menampilkan <span className="font-medium">{jadwals.from}</span> sampai{' '}
                                        <span className="font-medium">{jadwals.to}</span> dari{' '}
                                        <span className="font-medium">{jadwals.total}</span> data
                                    </div>
                                    <div className="flex space-x-2">
                                        {jadwals.links.map((link, index) => (
                                            link.url ? (
                                                <button
                                                    key={index}
                                                    onClick={() => router.get(link.url)}
                                                    className={`px-3 py-2 text-sm rounded-lg ${link.active
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ) : (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            {hasPendingChanges && (
                <div className="fixed bottom-28 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
                    <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-orange-600 dark:text-orange-400">{pendingChangesCount}</span> perubahan belum disimpan
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleCancelAll}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                disabled={saving}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSaveAll}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                disabled={saving}
                            >
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {confirmDialog.action === 'delete' ? 'Konfirmasi Hapus' : 'Konfirmasi Batal Semua'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {confirmDialog.action === 'delete'
                                ? `Apakah Anda yakin ingin menghapus jadwal "${confirmDialog.data?.jadwalInfo}"?`
                                : confirmDialog.action === 'sinkron-jurnal'
                                    ? 'Sistem akan membuat jurnal guru berdasarkan jadwal yang terfilter. Jadwal dengan waktu berurutan akan digabung menjadi satu jurnal. Lanjutkan?'
                                    : `Apakah Anda yakin ingin membatalkan semua perubahan (${pendingChangesCount} perubahan)?`
                            }
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmDialog({ isOpen: false, action: null, data: null })}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmDialog.action === 'delete' ? confirmDelete : confirmCancelAll}
                                className="px-4 py-2 text-white rounded-lg bg-red-600 hover:bg-red-700"
                            >
                                {confirmDialog.action === 'delete' ? 'Hapus' : 'Ya, Batalkan Semua'}
                            </button>
                        </div>
                    </div>
                </div>
            )
            }

            <BottomNav />
        </AuthenticatedLayout >
    );
}
