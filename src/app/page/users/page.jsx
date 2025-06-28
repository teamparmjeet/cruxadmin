'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';

// --- Reusable SVG Icons ---
const SearchIcon = () => (<svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
const SortIcon = ({ direction }) => {
    if (!direction) return <svg className="h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" /></svg>;
    if (direction === 'ascending') return <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6" /></svg>;
    return <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>;
};
const BlockIcon = () => (<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>);
const UnblockIcon = () => (<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m18 8 5 5m0-5-5 5" /></svg>);
const DeleteIcon = () => (<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M5 6l1-1h12l1 1" /></svg>);

export default function AllUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'joinDate', direction: 'descending' });

    const { data: session } = useSession();
    useEffect(() => {
        const fetchUsers = async () => {
            if (!session?.accessToken) return;
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/`, {
                    headers: { Authorization: `Bearer ${session.accessToken}` },
                });

                const mappedUsers = res.data.map(user => ({
                    id: user._id,
                    name: user.username,
                    avatar: user.avatar || `https://i.pravatar.cc/150?u=${user._id}`,
                    followers: user.followers.length || 0,
                    following: user.following.length || 0,
                    joinDate: user.joinDate || user.createdAt,
                    isSuspended: !!user.isSuspended, // ✅ Ensure boolean
                }));

                setUsers(mappedUsers);
            } catch (error) {
                console.error('❌ Failed to fetch users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [session?.accessToken]);

    const handleToggleStatus = async (userId) => {
        const user = users.find(u => u.id === userId);
        if (!user || !session?.accessToken) return;

        const newIsSuspended = !user.isSuspended;

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`,
                { isSuspended: newIsSuspended },
                { headers: { Authorization: `Bearer ${session.accessToken}` } }
            );

            setUsers(currentUsers =>
                currentUsers.map(u =>
                    u.id === userId ? { ...u, isSuspended: response.data.isSuspended } : u
                )
            );

            alert(`User ${user.name} has been ${newIsSuspended ? "Suspended" : "Activated"}.`);
        } catch (error) {
            console.error("Error updating user status:", error);
            alert("Failed to update user status.");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            setUsers(users => users.filter(user => user.id !== userId));
        } catch (err) {
            console.error("Failed to delete user:", err);
            alert("An error occurred while deleting the user.");
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredAndSortedUsers = useMemo(() => {
        let sortableUsers = [...users];

        if (statusFilter === 'Active') {
            sortableUsers = sortableUsers.filter(user => !user.isSuspended);
        } else if (statusFilter === 'Suspended') {
            sortableUsers = sortableUsers.filter(user => user.isSuspended);
        }

        if (searchQuery) {
            sortableUsers = sortableUsers.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        sortableUsers.sort((a, b) => {
            let aVal = a[sortConfig.key];
            let bVal = b[sortConfig.key];
            if (sortConfig.key === 'joinDate') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return sortableUsers;
    }, [users, searchQuery, statusFilter, sortConfig]);

    const statusStyles = {
        true: "bg-red-100 text-red-600",
        false: "bg-green-100 text-green-600",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
                <p className="mt-1 text-sm text-gray-600">View, search, and manage all users in the system.</p>
            </div>

            <div className="p-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-grow w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                    <input type="search" placeholder="Search by name or ID..." className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="w-full sm:w-auto">
                    <select className="block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 w-[35%]"><button onClick={() => requestSort('name')} className="flex items-center gap-1 group">Name <SortIcon direction={sortConfig.key === 'name' ? sortConfig.direction : null} /></button></th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 hidden md:table-cell"><button onClick={() => requestSort('followers')} className="flex items-center gap-1 group">Followers <SortIcon direction={sortConfig.key === 'followers' ? sortConfig.direction : null} /></button></th>
                            <th className="px-6 py-3 hidden md:table-cell">Following</th>
                            <th className="px-6 py-3 hidden lg:table-cell"><button onClick={() => requestSort('joinDate')} className="flex items-center gap-1 group">Join Date <SortIcon direction={sortConfig.key === 'joinDate' ? sortConfig.direction : null} /></button></th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-400">Loading users...</td></tr>
                        ) : filteredAndSortedUsers.length > 0 ? (
                            filteredAndSortedUsers.map((user) => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img className="w-10 h-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                                            <div>
                                                <div className="font-medium text-gray-900">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 font-medium rounded-full text-xs ${statusStyles[user.isSuspended]}`}>
                                            {user.isSuspended ? "Suspended" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">{user.followers.toLocaleString()}</td>
                                    <td className="px-6 py-4 hidden md:table-cell">{user.following.toLocaleString()}</td>
                                    <td className="px-6 py-4 hidden lg:table-cell">{new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!user.isSuspended ? (
                                                <button onClick={() => handleToggleStatus(user.id)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-yellow-600 transition-colors" title="Suspend User"><BlockIcon /></button>
                                            ) : (
                                                <button onClick={() => handleToggleStatus(user.id)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-green-600 transition-colors" title="Activate User"><UnblockIcon /></button>
                                            )}
                                            <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 hover:text-red-600 transition-colors" title="Delete User"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-500">No users found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
