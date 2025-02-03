import { useEffect, useState } from "react";
import { useController } from "react-hook-form";

const SelectField = ({
  name,
  label,
  options = [],
  control,
  multiple = false, // ✅ Supports both single and multiple selections
  placeholder = "-- Select Option --",
}) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const [selectedValues, setSelectedValues] = useState(value || (multiple ? [] : ""));

  // ✅ Only initialize value once on mount
  useEffect(() => {
    if (value) {
      setSelectedValues(value);
    }
  }, []); // ✅ Empty dependency array ensures it runs only once

  // Handle selection (single or multiple)
  const handleSelection = (e) => {
    const selectedValue = String(e.target.value);

    if (multiple) {
      if (!selectedValues.includes(selectedValue)) {
        const updatedValues = [...selectedValues, selectedValue];
        setSelectedValues(updatedValues);
        onChange(updatedValues); // ✅ Update form state
      }
    } else {
      setSelectedValues(selectedValue);
      onChange(selectedValue); // ✅ Update form state
    }
  };

  // Handle removal (only for multiple selections)
  const handleRemove = (item) => {
    if (multiple) {
      const updatedValues = selectedValues.filter((val) => val !== item);
      setSelectedValues(updatedValues);
      onChange(updatedValues); // ✅ Update form state
    }
  };

  return (
    <div className="flex flex-col w-full md:w-1/4">
      <label className="text-xs text-gray-500">{label}</label>
      <select className="border text-sm text-gray-500 mt-2 ring-[1.5px] ring-gray-300 rounded-md p-2 text-sm" onChange={handleSelection}>
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>

      {/* Display selected items if multiple */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 ">
          {selectedValues.map((val) => {
            const item = options.find((opt) => String(opt.id) === val);
            return (
              <span key={val} className="bg-gray-200 px-2 py-1 rounded-md text-sm flex items-center">
                {item?.name || "Unknown"}
                <button type="button" className="ml-2 text-red-500 font-bold" onClick={() => handleRemove(val)}>
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Display errors */}
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
};

export default SelectField;
