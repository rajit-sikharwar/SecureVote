import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryBadge } from '@/components/shared/CategoryBadge';
import { Avatar } from '@/components/ui/Avatar';
import type { UserCategory } from '@/types';

type Voter = {
  id: string;
  fullName?: string;
  email?: string;
  role?: 'admin' | 'voter';
  category?: UserCategory;
  photoURL?: string;
  registeredAt?: unknown;
};

export default function AdminVoters() {

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const formatRegisteredAt = (value: unknown): string => {
    return value instanceof Timestamp
      ? format(value.toDate(), 'MMM d, yyyy - h:mm a')
      : 'Unknown';
  };

  useEffect(() => {

    const fetchVoters = async () => {

      try {

        const q = query(
          collection(db, 'users'),
          orderBy('registeredAt', 'desc'),
          limit(100)
        );

        const snapshot = await getDocs(q);

        const data: Voter[] = snapshot.docs.map(doc => ({
          ...(doc.data() as Omit<Voter, 'id'>),
          id: doc.id,
        }));

        setVoters(data);

      } catch (err: unknown) {

        console.error('Error fetching voters:', err);

      } finally {

        setLoading(false);

      }

    };

    fetchVoters();

  }, []);

  const filteredVoters = voters.filter(v =>
    v.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {

    return (

      <div className="space-y-6">

        <div className="flex justify-between items-center mb-6">
          <Skeleton variant="text" className="w-32 h-8" />
          <Skeleton variant="text" className="w-48 h-10" />
        </div>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
          <div className="p-4 border-b border-gray-100">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
          <div className="p-4">
            <Skeleton variant="text" className="w-1/3 h-6" />
          </div>
        </Card>

      </div>

    );

  }

  return (

    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">

        <h1 className="text-2xl font-bold text-gray-900">
          Voters Directory
        </h1>

        <div className="w-full sm:w-72">

          <Input
            placeholder="Search voters by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />

        </div>

      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm whitespace-nowrap">

            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium tracking-wide">

              <tr>
                <th className="px-6 py-4">Voter Profile</th>
                <th className="px-6 py-4">Role / Category</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {filteredVoters.length === 0 ? (

                <tr>

                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No voters found matching your search.
                  </td>

                </tr>

              ) : (

                filteredVoters.map((voter) => (

                  <tr key={voter.id} className="hover:bg-gray-50/50 transition-colors">

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <Avatar
                          src={voter.photoURL}
                          fallback={voter.fullName || 'V'}
                          size="sm"
                        />

                        <div>

                          <div className="font-semibold text-gray-900">
                            {voter.fullName || 'Anonymous'}
                          </div>

                          <div className="text-gray-500 text-xs">
                            {voter.email}
                          </div>

                        </div>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      {voter.role === 'admin' ? (

                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          👑 Admin
                        </span>

                      ) : (

                        <CategoryBadge category={voter.category as UserCategory} />

                      )}

                    </td>

                    <td className="px-6 py-4 text-gray-600">

                      {formatRegisteredAt(voter.registeredAt)}

                    </td>

                    <td className="px-6 py-4 flex items-center gap-1.5 text-emerald-600 font-medium">

                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Active

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}
