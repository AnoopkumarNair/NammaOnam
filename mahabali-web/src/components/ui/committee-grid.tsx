"use client";

import { CommitteeMember } from "@/types/festival";

interface CommitteeGridProps {
  members?: CommitteeMember[];
}

export function CommitteeGrid({ members }: CommitteeGridProps) {
  const displayMembers = members && members.length > 0 ? members : [
    { Name: "Ramesh Krishnan", Role: "Event Chairperson", Contact: "+91 98765 43210", Active: "TRUE" },
    { Name: "Suresh Menon", Role: "Cultural Head", Contact: "+91 98765 43211", Active: "TRUE" },
    { Name: "Anita Nair", Role: "Food & Feast", Contact: "+91 98765 43212", Active: "TRUE" },
    { Name: "Vijay Thomas", Role: "Sports & Games", Contact: "+91 98765 43213", Active: "TRUE" },
    { Name: "Priya Pillai", Role: "Registrations", Contact: "+91 98765 43214", Active: "TRUE" },
    { Name: "Kiran Dev", Role: "Logistics", Contact: "+91 98765 43215", Active: "TRUE" }
  ];

  // Group by Role/Section
  const grouped = displayMembers.reduce((acc, member) => {
    const role = member.Role || "General";
    if (!acc[role]) acc[role] = [];
    acc[role].push(member);
    return acc;
  }, {} as Record<string, typeof displayMembers>);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12">
      {(!members || members.length === 0) && (
        <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-xs font-bold shadow-sm border border-amber-200 animate-pulse text-center w-fit mx-auto mb-8">
          🔍 Displaying Sample Contacts
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {Object.entries(grouped).map(([role, roleMembers]) => (
          <div key={role} className="flex flex-col gap-4">
            <h4 className="font-black text-lg tracking-wider text-[var(--color-onam-orange)] border-b-2 border-yellow-200/50 pb-2 uppercase">
              {role}
            </h4>
            <ul className="flex flex-col gap-3">
              {roleMembers.map((member, idx) => (
                <li key={`${member.Name}-${idx}`} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:border-yellow-300 transition-colors">
                  <span className="font-bold text-gray-800 text-base">{member.Name}</span>
                  <a href={`tel:${member.Contact}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    📞 {member.Contact}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
