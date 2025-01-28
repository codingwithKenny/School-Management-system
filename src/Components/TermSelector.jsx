"use client";

import { useRouter } from "next/navigation";

const TermSelector = ({ terms, selectedTermId }) => {
  const router = useRouter();

  const handleChange = (e) => {
    const termId = e.target.value;
    const query = termId ? `?termId=${termId}` : "";
    router.push(`/list/assessments${query}`); // Redirect with the selected term
  };

  return (
    <div className="mb-4">
      <label htmlFor="term" className="block text-sm font-medium text-gray-700">
        Select Term
      </label>
      <select
        id="term"
        name="term"
        defaultValue={selectedTermId || ""}
        onChange={handleChange}
        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="">All Terms</option>
        {terms.map((term) => (
          <option key={term.term_id} value={term.term_id}>
            {term.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TermSelector;
