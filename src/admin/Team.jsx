import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Team() {
  const { profile } = useAuth();
  const [rows, setRows] = useState([]);
  const load = () => supabase.from('profiles').select('*').order('created_at').then(({ data }) => setRows(data || []));
  useEffect(() => { load(); }, []);

  async function setRole(id, role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id);
    if (error) alert(error.message);
    load();
  }

  return (
    <div>
      <div className="admin-head"><h1>Team & roles</h1></div>
      <div className="note">
        <p><strong>To add a travel advisor:</strong> in Supabase go to Authentication, Users, Invite user, and enter their email. When they appear below, set their role to <em>advisor</em>.</p>
        <p>Advisors can manage inquiries, packages, hotels, vehicles and attractions. Admins can also delete items, edit website settings and change roles.</p>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td data-label="Name">{r.full_name || '-'}</td>
                <td data-label="Email">{r.email}</td>
                <td data-label="Role">
                  <select value={r.role} disabled={r.id === profile.id} onChange={(e) => setRole(r.id, e.target.value)} aria-label={`Role for ${r.email}`}>
                    <option value="traveler">traveler</option>
                    <option value="advisor">advisor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
