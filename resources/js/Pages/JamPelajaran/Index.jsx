import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '@/Components/BottomNav';

export default function Index({ auth, jamPelajarans, cabangs, periodeAkademiks, activePeriode, filters }) {
    // Filter states
    const [filterHari, setFilterHari] = useState(filters?.hari || '');
    const [filterCabang, setFilterCabang] = useState(filters?.cabang_id || '');
    const [filterDepartemen, setFilterDepartemen] = useState(filters?.departemen_id || '');
    const [departemens, setDepartemens] = useState([]);
    const [loadingDepartemen, setLoadingDepartemen] = useState(false);

    // Batch save states
    const [newRows, setNewRows] = useState([]);
    const [editedRows, setEditedRows] = useState({});
    const [deletedIds, setDeletedIds] = useState([]);
    const [editingIds, setEditingIds] = useState([]);

    // Dropdown data states for new and edit rows
    const [newRowsDropdowns, setNewRowsDropdowns] = useState({});
    const [editRowsDropdowns, setEditRowsDropdowns] = useState({});

    // Loading states for cascading dropdowns
    const [loadingNewRowDept, setLoadingNewRowDept] = useState({});
    const [loadingEditRowDept, setLoadingEditRowDept] = useState({});

    const hariOptions = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    // Check if there are pending changes
    const hasPendingChanges = newRows.length > 0 || Object.keys(editedRows).length > 0 || deletedIds.length > 0;

    // Fetch departemen when filter cabang changes
    useEffect(() => {
        if (filterCabang) {
            setLoadingDepartemen(true);
            axios.get(route('api.departemen.by-cabang', filterCabang))
                .then(response => {
                    setDepartemens(response.data);
                    setLoadingDepartemen(false);
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingDepartemen(false);
                });
        } else {
            setDepartemens([]);
            setFilterDepartemen('');
        }
    }, [filterCabang]);

    // Apply filters
    const applyFilters = () => {
        router.get(route('jam-pelajaran.index'), {
            hari: filterHari,
            cabang_id: filterCabang,
            departemen_id: filterDepartemen,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const hasPermission = (permission) => {
        return auth.role === 'Admin' || (auth.permissions && auth.permissions.includes(permission));
    };

    // Clear filters
    const clearFilters = () => {
        setFilterHari('');
        setFilterCabang('');
        setFilterDepartemen('');
        router.get(route('jam-pelajaran.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Add new row
    const addNewRow = () => {
        const tempId = `new_${Date.now()}`;
        setNewRows([...newRows, {
            tempId,
            periode_akademik_id: activePeriode?.id || '',
            cabang_id: '',
            departemen_id: '',
            hari: '',
            nama: '',
            jam_mulai: '',
            jam_selesai: '',
        }]);
        setNewRowsDropdowns({ ...newRowsDropdowns, [tempId]: { departemens: [] } });
    };

    // Remove new row
    const removeNewRow = (tempId) => {
        setNewRows(newRows.filter(row => row.tempId !== tempId));
        const newDropdowns = { ...newRowsDropdowns };
        delete newDropdowns[tempId];
        setNewRowsDropdowns(newDropdowns);
    };

    // Update new row field
    const updateNewRow = (tempId, field, value) => {
        // Ensure time fields have seconds (HH:MM:SS format)
        if ((field === 'jam_mulai' || field === 'jam_selesai') && value && value.length === 5) {
            value = value + ':00';
        }

        setNewRows(newRows.map(row => {
            if (row.tempId === tempId) {
                const updatedRow = { ...row, [field]: value };

                // If cabang changes, fetch departemen and reset departemen_id
                if (field === 'cabang_id') {
                    updatedRow.departemen_id = '';
                    if (value) {
                        setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: true });
                        axios.get(route('api.departemen.by-cabang', value))
                            .then(response => {
                                setNewRowsDropdowns({
                                    ...newRowsDropdowns,
                                    [tempId]: { departemens: response.data }
                                });
                                setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: false });
                            })
                            .catch(error => {
                                console.error('Error fetching departemen:', error);
                                setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: false });
                            });
                    } else {
                        setNewRowsDropdowns({
                            ...newRowsDropdowns,
                            [tempId]: { departemens: [] }
                        });
                    }
                }

                return updatedRow;
            }
            return row;
        }));
    };

    // Handle cabang change for new row (fetch departemen)
    const handleNewRowCabangChange = (tempId, cabangId) => {
        // Update cabang_id and reset departemen_id in single state update
        setNewRows(newRows.map(row => {
            if (row.tempId === tempId) {
                return {
                    ...row,
                    cabang_id: cabangId,
                    departemen_id: ''
                };
            }
            return row;
        }));

        // Fetch departemen if cabang selected
        if (cabangId) {
            setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: true });
            axios.get(`/api/departemen/by-cabang/${cabangId}`)
                .then(response => {
                    setNewRowsDropdowns({
                        ...newRowsDropdowns,
                        [tempId]: { departemens: response.data }
                    });
                    setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: false });
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingNewRowDept({ ...loadingNewRowDept, [tempId]: false });
                });
        } else {
            setNewRowsDropdowns({
                ...newRowsDropdowns,
                [tempId]: { departemens: [] }
            });
        }
    };

    // Start editing existing row
    const startEdit = (jamPelajaran) => {
        setEditingIds([...editingIds, jamPelajaran.id]);
        setEditedRows({
            ...editedRows,
            [jamPelajaran.id]: {
                periode_akademik_id: jamPelajaran.periode_akademik_id,
                cabang_id: jamPelajaran.cabang_id,
                departemen_id: jamPelajaran.departemen_id || '',
                hari: jamPelajaran.hari,
                nama: jamPelajaran.nama,
                jam_mulai: jamPelajaran.jam_mulai,
                jam_selesai: jamPelajaran.jam_selesai,
            }
        });

        // Fetch departemen for this row if cabang is set
        if (jamPelajaran.cabang_id) {
            setLoadingEditRowDept({ ...loadingEditRowDept, [jamPelajaran.id]: true });
            axios.get(route('api.departemen.by-cabang', jamPelajaran.cabang_id))
                .then(response => {
                    setEditRowsDropdowns({
                        ...editRowsDropdowns,
                        [jamPelajaran.id]: { departemens: response.data }
                    });
                    setLoadingEditRowDept({ ...loadingEditRowDept, [jamPelajaran.id]: false });
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingEditRowDept({ ...loadingEditRowDept, [jamPelajaran.id]: false });
                });
        }
    };

    // Handle cabang change for edit row (fetch departemen)
    const handleEditRowCabangChange = (id, cabangId) => {
        // Update cabang_id and reset departemen_id in single state update
        setEditedRows({
            ...editedRows,
            [id]: {
                ...editedRows[id],
                cabang_id: cabangId,
                departemen_id: ''
            }
        });

        // Fetch departemen if cabang selected
        if (cabangId) {
            setLoadingEditRowDept({ ...loadingEditRowDept, [id]: true });
            axios.get(route('api.departemen.by-cabang', cabangId))
                .then(response => {
                    setEditRowsDropdowns({
                        ...editRowsDropdowns,
                        [id]: { departemens: response.data }
                    });
                    setLoadingEditRowDept({ ...loadingEditRowDept, [id]: false });
                })
                .catch(error => {
                    console.error('Error fetching departemen:', error);
                    setLoadingEditRowDept({ ...loadingEditRowDept, [id]: false });
                });
        } else {
            setEditRowsDropdowns({
                ...editRowsDropdowns,
                [id]: { departemens: [] }
            });
        }
    };

    // Cancel editing
    const cancelEdit = (id) => {
        setEditingIds(editingIds.filter(editId => editId !== id));
        const newEditedRows = { ...editedRows };
        delete newEditedRows[id];
        setEditedRows(newEditedRows);

        const newDropdowns = { ...editRowsDropdowns };
        delete newDropdowns[id];
        setEditRowsDropdowns(newDropdowns);
    };

    // Update edited row field
    const updateEditedRow = (id, field, value) => {
        // Ensure time fields have seconds (HH:MM:SS format)
        if ((field === 'jam_mulai' || field === 'jam_selesai') && value && value.length === 5) {
            value = value + ':00';
        }

        const updatedRow = { ...editedRows[id], [field]: value };

        // If cabang changes, fetch departemen and reset departemen_id
        if (field === 'cabang_id') {
            updatedRow.departemen_id = '';
            if (value) {
                setLoadingEditRowDept({ ...loadingEditRowDept, [id]: true });
                axios.get(route('api.departemen.by-cabang', value))
                    .then(response => {
                        setEditRowsDropdowns({
                            ...editRowsDropdowns,
                            [id]: { departemens: response.data }
                        });
                        setLoadingEditRowDept({ ...loadingEditRowDept, [id]: false });
                    })
                    .catch(error => {
                        console.error('Error fetching departemen:', error);
                        setLoadingEditRowDept({ ...loadingEditRowDept, [id]: false });
                    });
            } else {
                setEditRowsDropdowns({
                    ...editRowsDropdowns,
                    [id]: { departemens: [] }
                });
            }
        }

        setEditedRows({ ...editedRows, [id]: updatedRow });
    };

    // Mark row for deletion
    const markForDeletion = (id) => {
        setDeletedIds([...deletedIds, id]);
        // If row was being edited, cancel edit
        if (editingIds.includes(id)) {
            cancelEdit(id);
        }
    };

    // Undo deletion
    const undoDeletion = (id) => {
        setDeletedIds(deletedIds.filter(deletedId => deletedId !== id));
    };

    // Cancel all changes
    const cancelAllChanges = () => {
        setNewRows([]);
        setEditedRows({});
        setDeletedIds([]);
        setEditingIds([]);
        setNewRowsDropdowns({});
        setEditRowsDropdowns({});
    };

    // Save all changes
    const saveAllChanges = () => {
        const data = {
            new: newRows.map(({ tempId, ...row }) => row),
            edited: editedRows,
            deleted: deletedIds,
        };

        router.post(route('jam-pelajaran.batch-save'), data, {
            onSuccess: () => {
                setNewRows([]);
                setEditedRows({});
                setDeletedIds([]);
                setEditingIds([]);
                setNewRowsDropdowns({});
                setEditRowsDropdowns({});
            },
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Jam Pelajaran</h2>}
        >
            <Head title="Jam Pelajaran" />

            <div className={`py-12 ${hasPendingChanges ? 'pb-64' : 'pb-32'}`}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Jam Pelajaran</h3>
                                {hasPermission('jam_pelajaran.create') && (
                                    <button
                                        onClick={addNewRow}
                                        className="px-4 py-2 text-white rounded-lg transition hover:opacity-90 active:opacity-100 focus:outline-none"
                                        style={{
                                            backgroundColor: 'var(--color-primary)',
                                        }}
                                    >
                                        + Tambah Baris
                                    </button>
                                )}
                            </div>

                            {/* Filter Section */}
                            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Filter Data</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hari</label>
                                        <select
                                            value={filterHari}
                                            onChange={(e) => setFilterHari(e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Semua Hari</option>
                                            {hariOptions.map((hari) => (
                                                <option key={hari} value={hari}>{hari}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Cabang</label>
                                        <select
                                            value={filterCabang}
                                            onChange={(e) => setFilterCabang(e.target.value)}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Semua Cabang</option>
                                            {cabangs.map((cabang) => (
                                                <option key={cabang.id} value={cabang.id}>{cabang.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Departemen</label>
                                        <select
                                            value={filterDepartemen}
                                            onChange={(e) => setFilterDepartemen(e.target.value)}
                                            disabled={!filterCabang || loadingDepartemen}
                                            className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50"
                                        >
                                            <option value="">
                                                {loadingDepartemen ? 'Loading...' : !filterCabang ? 'Pilih Cabang Dulu' : 'Semua Departemen'}
                                            </option>
                                            {departemens.map((departemen) => (
                                                <option key={departemen.id} value={departemen.id}>{departemen.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end space-x-2">
                                        <button
                                            onClick={applyFilters}
                                            className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition"
                                        >
                                            Terapkan
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {jamPelajarans.data.length === 0 && newRows.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    Belum ada data jam pelajaran
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Periode</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cabang</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departemen</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hari</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jam Mulai</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Jam Selesai</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {/* Existing Rows */}
                                                {jamPelajarans.data.map((jamPelajaran, index) => {
                                                    const isEditing = editingIds.includes(jamPelajaran.id);
                                                    const isDeleted = deletedIds.includes(jamPelajaran.id);
                                                    const editData = editedRows[jamPelajaran.id] || {};

                                                    return (
                                                        <tr
                                                            key={jamPelajaran.id}
                                                            className={`${isDeleted ? 'bg-red-50 dark:bg-red-900/20' : isEditing ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}`}
                                                        >
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 ${isDeleted ? 'line-through' : ''}`}>
                                                                {jamPelajarans.from + index}
                                                            </td>

                                                            {/* Periode */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <select
                                                                        value={editData.periode_akademik_id}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'periode_akademik_id', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                    >
                                                                        <option value="">Pilih Periode</option>
                                                                        {periodeAkademiks.map((periode) => (
                                                                            <option key={periode.id} value={periode.id}>
                                                                                {periode.nama}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">
                                                                        {jamPelajaran.periode_akademik?.nama || '-'}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Cabang */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <select
                                                                        value={editData.cabang_id}
                                                                        onChange={(e) => handleEditRowCabangChange(jamPelajaran.id, e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                    >
                                                                        <option value="">Pilih Cabang</option>
                                                                        {(cabangs || []).map((cabang) => (
                                                                            <option key={cabang.id} value={cabang.id}>
                                                                                {cabang.nama}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">
                                                                        {jamPelajaran.cabang?.nama || '-'}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Departemen */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <select
                                                                        value={editData.departemen_id}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'departemen_id', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                        disabled={!editData.cabang_id || loadingEditRowDept[jamPelajaran.id]}
                                                                    >
                                                                        <option value="">Pilih Departemen</option>
                                                                        {(editRowsDropdowns[jamPelajaran.id]?.departemens || []).map((dept) => (
                                                                            <option key={dept.id} value={dept.id}>
                                                                                {dept.nama}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">
                                                                        {jamPelajaran.departemen?.nama || '-'}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Hari */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <select
                                                                        value={editData.hari}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'hari', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                    >
                                                                        <option value="">Pilih Hari</option>
                                                                        {hariOptions.map((hari) => (
                                                                            <option key={hari} value={hari}>{hari}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">{jamPelajaran.hari}</span>
                                                                )}
                                                            </td>

                                                            {/* Nama */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="text"
                                                                        value={editData.nama}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'nama', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                        placeholder="Nama Jam Pelajaran"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{jamPelajaran.nama}</span>
                                                                )}
                                                            </td>

                                                            {/* Jam Mulai */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="time"
                                                                        value={editData.jam_mulai}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'jam_mulai', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">{jamPelajaran.jam_mulai}</span>
                                                                )}
                                                            </td>

                                                            {/* Jam Selesai */}
                                                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDeleted ? 'line-through' : ''}`}>
                                                                {isEditing ? (
                                                                    <input
                                                                        type="time"
                                                                        value={editData.jam_selesai}
                                                                        onChange={(e) => updateEditedRow(jamPelajaran.id, 'jam_selesai', e.target.value)}
                                                                        className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                    />
                                                                ) : (
                                                                    <span className="text-gray-900 dark:text-gray-100">{jamPelajaran.jam_selesai}</span>
                                                                )}
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                                {isDeleted ? (
                                                                    <button
                                                                        onClick={() => undoDeletion(jamPelajaran.id)}
                                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    >
                                                                        Undo
                                                                    </button>
                                                                ) : isEditing ? (
                                                                    <button
                                                                        onClick={() => cancelEdit(jamPelajaran.id)}
                                                                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                                                                    >
                                                                        Batal
                                                                    </button>
                                                                ) : (
                                                                    <>
                                                                        {hasPermission('jam_pelajaran.edit') && (
                                                                            <button
                                                                                onClick={() => startEdit(jamPelajaran)}
                                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                        )}
                                                                        {hasPermission('jam_pelajaran.delete') && (
                                                                            <button
                                                                                onClick={() => markForDeletion(jamPelajaran.id)}
                                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                            >
                                                                                Hapus
                                                                            </button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                {/* New Rows */}
                                                {newRows.map((row, index) => (
                                                    <tr key={row.tempId} className="bg-green-50 dark:bg-green-900/20">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            Baru {index + 1}
                                                        </td>

                                                        {/* Periode */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <select
                                                                value={row.periode_akademik_id}
                                                                onChange={(e) => updateNewRow(row.tempId, 'periode_akademik_id', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                            >
                                                                <option value="">Pilih Periode</option>
                                                                {periodeAkademiks.map((periode) => (
                                                                    <option key={periode.id} value={periode.id}>
                                                                        {periode.nama}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Cabang */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <select
                                                                value={row.cabang_id}
                                                                onChange={(e) => handleNewRowCabangChange(row.tempId, e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                            >
                                                                <option value="">Pilih Cabang</option>
                                                                {(cabangs || []).map((cabang) => (
                                                                    <option key={cabang.id} value={cabang.id}>
                                                                        {cabang.nama}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Departemen */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <select
                                                                value={row.departemen_id}
                                                                onChange={(e) => updateNewRow(row.tempId, 'departemen_id', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                disabled={!row.cabang_id || loadingNewRowDept[row.tempId]}
                                                            >
                                                                <option value="">Pilih Departemen</option>
                                                                {(newRowsDropdowns[row.tempId]?.departemens || []).map((dept) => (
                                                                    <option key={dept.id} value={dept.id}>
                                                                        {dept.nama}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Hari */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <select
                                                                value={row.hari}
                                                                onChange={(e) => updateNewRow(row.tempId, 'hari', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                            >
                                                                <option value="">Pilih Hari</option>
                                                                {hariOptions.map((hari) => (
                                                                    <option key={hari} value={hari}>{hari}</option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        {/* Nama */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <input
                                                                type="text"
                                                                value={row.nama}
                                                                onChange={(e) => updateNewRow(row.tempId, 'nama', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                                placeholder="Nama Jam Pelajaran"
                                                            />
                                                        </td>

                                                        {/* Jam Mulai */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <input
                                                                type="time"
                                                                value={row.jam_mulai}
                                                                onChange={(e) => updateNewRow(row.tempId, 'jam_mulai', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                            />
                                                        </td>

                                                        {/* Jam Selesai */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <input
                                                                type="time"
                                                                value={row.jam_selesai}
                                                                onChange={(e) => updateNewRow(row.tempId, 'jam_selesai', e.target.value)}
                                                                className="w-full text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md"
                                                            />
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => removeNewRow(row.tempId)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Hapus
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {jamPelajarans.last_page > 1 && (
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                Menampilkan <span className="font-medium">{jamPelajarans.from}</span> sampai{' '}
                                                <span className="font-medium">{jamPelajarans.to}</span> dari{' '}
                                                <span className="font-medium">{jamPelajarans.total}</span> data
                                            </div>
                                            <div className="flex space-x-2">
                                                {jamPelajarans.links.map((link, index) => (
                                                    link.url ? (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            preserveScroll
                                                            className={`px-3 py-2 text-sm rounded-lg transition ${link.active
                                                                ? 'bg-purple-600 text-white'
                                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                                }`}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            {hasPendingChanges && (
                <div className="fixed left-0 right-0 bottom-28 z-40 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div
                            className="text-white rounded-lg shadow-lg p-4 flex items-center justify-between"
                            style={{
                                backgroundColor: 'var(--color-primary)'
                            }}
                        >
                            <div className="text-sm font-medium">
                                {newRows.length > 0 && <span className="mr-4">Baru: {newRows.length}</span>}
                                {Object.keys(editedRows).length > 0 && <span className="mr-4">Diubah: {Object.keys(editedRows).length}</span>}
                                {deletedIds.length > 0 && <span>Dihapus: {deletedIds.length}</span>}
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelAllChanges}
                                    className="px-4 py-2 bg-white rounded-lg hover:bg-gray-100 transition font-medium"
                                    style={{
                                        color: 'var(--color-primary)'
                                    }}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={saveAllChanges}
                                    className="px-4 py-2 rounded-lg transition font-medium"
                                    style={{
                                        backgroundColor: 'var(--color-primary-light)',
                                        color: 'var(--color-primary-dark)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                >
                                    Simpan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BottomNav />
        </AuthenticatedLayout>
    );
}
