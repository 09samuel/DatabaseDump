import { useEffect, useState, useCallback } from "react";
import { X, UserPlus, Trash2, Mail } from "lucide-react";
import { getCollaborators, addCollaborator, deleteCollaborator, updateCollaboratorRole } from "../../../services/collaborator.service";
import StatusBar from "../../../components/StatusBar/StatusBar";
import type { CollaboratorRoles } from "../types";

interface ManageCollaboratorsModalProps {
    dbId: string;
    onClose: () => void;
}

function ManageCollaboratorsModal({ dbId, onClose }: ManageCollaboratorsModalProps) {
    const [collaborators, setCollaborators] = useState<{ id: string; email: string, name: string, role: CollaboratorRoles }[]>([]);
    const [loading, setLoading] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<CollaboratorRoles>("VIEWER");
    const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", message: string } | null>(null);

    const fetchCollaborators = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCollaborators(dbId);
            setCollaborators(data);
        } catch (err) {
            setStatusMessage({ type: "error", message: "Failed to load collaborators" });
        } finally {
            setLoading(false);
        }
    }, [dbId]);

    useEffect(() => {
        fetchCollaborators();
    }, [fetchCollaborators]);

    useEffect(() => {
        if (!statusMessage) return;
        const t = setTimeout(() => setStatusMessage(null), 3000);
        return () => clearTimeout(t);
    }, [statusMessage]);

    const handleDelete = async (userId: string) => { 
        try {
            const result = await deleteCollaborator(dbId, userId);
            setCollaborators(prev => prev.filter(c => c.id !== userId));
            setStatusMessage({ type: "success", message: result.message });
        } catch (err) {
            setStatusMessage({ type: "error", message: "Failed to remove collaborator" });
        }
    };

    const handleRoleUpdate = async (userId: string, role: CollaboratorRoles) => { 
        try {
            const result = await updateCollaboratorRole(dbId, userId, role);
            setCollaborators(prev => prev.map(c => c.id === userId ? { ...c, role } : c));
            setStatusMessage({ type: "success", message: result.message });
        } catch (err) {
            setStatusMessage({ type: "error", message: "Failed to update collaborator role" });
        }
    };

    const addCollaboratorHandler = async () => {
        if (!newEmail) return;
        try {
            const result = await addCollaborator(dbId, newEmail, inviteRole);
            setStatusMessage({ type: "success", message: result.message });
            setNewEmail("");
            // API doesn't return object, so we refresh the list
            fetchCollaborators();
        } catch (err) {
            setStatusMessage({ type: "error", message: "Failed to invite collaborator" });
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex justify-center items-center bg-black/80 px-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Collaborators</h2>
                        <p className="text-sm text-gray-500">Control who can access this database</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 flex flex-col flex-1 min-h-0">
                    {/* Invite Section */}
                    <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100 shrink-0">
                        <label className="block text-sm font-semibold text-blue-900 mb-2">
                            Invite by Email
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="colleague@company.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="flex-1 px-4 py-2 border rounded border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0"
                            />
                            {/* Role selector for new invite */}
                            <select 
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as CollaboratorRoles)}
                                className="bg-white border border-blue-200 rounded px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
               
                                <option value="ADMIN">Admin</option>
                                <option value="OPERATOR">Operator</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                            <button 
                                onClick={addCollaboratorHandler}
                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors shrink-0"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Invite</span>
                            </button>
                        </div>
                    </div>

                    {/* Team List Section */}
                    <div className="flex flex-col flex-1 min-h-0">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Team</h3>
                        
                        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            {loading && collaborators.length === 0 ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {collaborators.map((collab) => (
                                        <div key={collab.id} className="py-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                    {collab.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-sm font-semibold text-gray-900 truncate">{collab.name || 'Pending Invite'}</h4>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                                        <Mail className="w-3 h-3 shrink-0" /> 
                                                        <span className="truncate">{collab.email}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 ml-4 shrink-0">
                                                <select 
                                                    value={collab.role}
                                                    disabled={collab.role.toUpperCase() === 'OWNER'}
                                                    className="text-xs font-medium bg-gray-100 border-none rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                    onChange={(e) => handleRoleUpdate(collab.id, e.target.value as CollaboratorRoles)}
                                                >   
                                                    <option value="OWNER">Owner</option>
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="OPERATOR">Operator</option>
                                                    <option value="VIEWER">Viewer</option>
                                                </select>
                                                
                                                {collab.role.toUpperCase() !== 'OWNER' && (
                                                    <button 
                                                        onClick={() => handleDelete(collab.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {statusMessage && (
                <StatusBar 
                    type={statusMessage.type} 
                    message={statusMessage.message} 
                    onClose={() => setStatusMessage(null)} 
                />
            )}
        </div>
    );
}

export default ManageCollaboratorsModal;