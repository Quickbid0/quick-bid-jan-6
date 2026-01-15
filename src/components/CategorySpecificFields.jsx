import React, { useState } from "react";
import { CAR_BODY_TYPES, BIKE_BODY_TYPES, SCOOTER_BODY_TYPES } from "../config/BodyTypeConfig";

const LabelInput = ({ label, name, type = "text", placeholder, formData, setFormData }) => (
  <div className="w-full md:w-1/2 px-2 mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={formData[name] || ''}
      onChange={(e) => setFormData(prev => ({ ...prev, [name]: e.target.value }))}
      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 dark:bg-gray-700 dark:text-white"
    />
  </div>
);

const LabelSelect = ({ label, name, options, formData, setFormData }) => (
  <div className="w-full md:w-1/2 px-2 mb-4">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <select
      name={name}
      value={formData[name] || ''}
      onChange={(e) => setFormData(prev => ({
        ...prev,
        [name]: e.target.value,
        ...(name === 'body_type' ? { body_type_auto: false } : {}),
      }))}
      className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const AccordionSection = ({ title, icon, children, subcategory }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border rounded-lg mb-4 shadow-sm bg-gray-50 dark:bg-gray-700">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 font-semibold bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-t flex items-center justify-between"
      >
        <span className="text-gray-900 dark:text-white">
          {icon} {title}
          {subcategory && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              / {subcategory}
            </span>
          )}
        </span>
        <span className="text-gray-600 dark:text-gray-300">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="flex flex-wrap px-4 py-2">
          {children}
        </div>
      )}
    </div>
  );
};

const CategorySpecificFields = ({ category, subcategory, formData, setFormData }) => {
  if (category === "Automobiles") {
    if (subcategory === "Cars") {
      return (
        <AccordionSection title="Automobiles" icon="🚗" subcategory="Cars">
          <LabelInput label="Brand" name="brand" formData={formData} setFormData={setFormData} />
          <LabelInput label="Model" name="model" formData={formData} setFormData={setFormData} />
          <LabelInput label="Year of Purchase" name="year" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="RC Available?" name="rc_available" formData={formData} setFormData={setFormData} options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
          <LabelInput label="Kilometers Driven" name="km_driven" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Fuel Type" name="fuel_type" formData={formData} setFormData={setFormData} options={[
            { value: "petrol", label: "Petrol" },
            { value: "diesel", label: "Diesel" },
            { value: "electric", label: "Electric" },
            { value: "hybrid", label: "Hybrid" },
          ]} />
          <LabelSelect label="Transmission" name="transmission" formData={formData} setFormData={setFormData} options={[
            { value: "manual", label: "Manual" },
            { value: "automatic", label: "Automatic" },
          ]} />
          <LabelSelect
            label="Body Type"
            name="body_type"
            formData={formData}
            setFormData={setFormData}
            options={CAR_BODY_TYPES.map((bt) => ({ value: bt, label: bt }))}
          />
          {formData.body_type && formData.body_type_auto && (
            <div className="w-full px-2 -mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              Suggested by AI from title – you can change this.
            </div>
          )}
        </AccordionSection>
      );
    }

    if (subcategory === "Bikes") {
      return (
        <AccordionSection title="Automobiles" icon="🏍️" subcategory="Bikes">
          <LabelInput label="Brand" name="brand" formData={formData} setFormData={setFormData} />
          <LabelInput label="Model" name="model" formData={formData} setFormData={setFormData} />
          <LabelInput label="Year of Purchase" name="year" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="RC Available?" name="rc_available" formData={formData} setFormData={setFormData} options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
          <LabelInput label="Kilometers Driven" name="km_driven" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Fuel Type" name="fuel_type" formData={formData} setFormData={setFormData} options={[
            { value: "petrol", label: "Petrol" },
            { value: "electric", label: "Electric" },
          ]} />
          <LabelSelect
            label="Body Type"
            name="body_type"
            formData={formData}
            setFormData={setFormData}
            options={BIKE_BODY_TYPES.map((bt) => ({ value: bt, label: bt }))}
          />
          {formData.body_type && formData.body_type_auto && (
            <div className="w-full px-2 -mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              Suggested by AI from title – you can change this.
            </div>
          )}
        </AccordionSection>
      );
    }

    if (subcategory === "Scooters") {
      return (
        <AccordionSection title="Automobiles" icon="🛵" subcategory="Scooters">
          <LabelInput label="Brand" name="brand" formData={formData} setFormData={setFormData} />
          <LabelInput label="Model" name="model" formData={formData} setFormData={setFormData} />
          <LabelInput label="Year of Purchase" name="year" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="RC Available?" name="rc_available" formData={formData} setFormData={setFormData} options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
          <LabelInput label="Kilometers Driven" name="km_driven" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Fuel Type" name="fuel_type" formData={formData} setFormData={setFormData} options={[
            { value: "petrol", label: "Petrol" },
            { value: "electric", label: "Electric" },
          ]} />
          <LabelSelect
            label="Body Type"
            name="body_type"
            formData={formData}
            setFormData={setFormData}
            options={SCOOTER_BODY_TYPES.map((bt) => ({ value: bt, label: bt }))}
          />
          {formData.body_type && formData.body_type_auto && (
            <div className="w-full px-2 -mt-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
              Suggested by AI from title – you can change this.
            </div>
          )}
        </AccordionSection>
      );
    }
  }

  const sectionMap = {
    "Home & Lifestyle": {
      icon: "🛋️",
      sub: subcategory,
      fields: (
        <>
          <LabelInput label="Item Type" name="item_type" formData={formData} setFormData={setFormData} />
          <LabelInput label="Material" name="material" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Condition" name="condition" formData={formData} setFormData={setFormData} options={[
            { value: "new", label: "New" },
            { value: "used", label: "Used" },
          ]} />
          <LabelInput label="Dimensions" name="dimensions" placeholder="e.g., 6ft x 4ft x 2ft" formData={formData} setFormData={setFormData} />
        </>
      ),
    },
    "Handmade & Creative Products": {
      icon: "🎨",
      fields: (
        <>
          <LabelInput label="Craft Type" name="craft_type" formData={formData} setFormData={setFormData} />
          <LabelInput label="Materials Used" name="materials" formData={formData} setFormData={setFormData} />
          <LabelInput label="Time to Make" name="time_to_make" placeholder="e.g., 3 days" formData={formData} setFormData={setFormData} />
        </>
      ),
    },
    "Antiques & Rare Collectibles": {
      icon: "🗿",
      fields: (
        <>
          <LabelInput label="Item Origin" name="origin" formData={formData} setFormData={setFormData} />
          <LabelInput label="Estimated Age" name="estimated_age" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Authenticity Certificate" name="auth_cert" formData={formData} setFormData={setFormData} options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]} />
        </>
      ),
    },
    "Industrial Equipment": {
      icon: "🛠️",
      fields: (
        <>
          <LabelInput label="Equipment Type" name="equipment_type" formData={formData} setFormData={setFormData} />
          <LabelInput label="Brand" name="brand" formData={formData} setFormData={setFormData} />
          <LabelInput label="Year of Manufacture" name="year" type="number" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Condition" name="condition" formData={formData} setFormData={setFormData} options={[
            { value: "working", label: "Working" },
            { value: "for_parts", label: "For Parts" },
          ]} />
        </>
      ),
    },
    "Creators' & Artists' Corner": {
      icon: "🖌️",
      fields: (
        <>
          <LabelInput label="Art Form" name="art_form" formData={formData} setFormData={setFormData} />
          <LabelInput label="Medium" name="medium" formData={formData} setFormData={setFormData} />
          <LabelSelect label="Original or Print?" name="originality" formData={formData} setFormData={setFormData} options={[
            { value: "original", label: "Original" },
            { value: "print", label: "Print" },
          ]} />
        </>
      ),
    },
  };

  if (sectionMap[category]) {
    const { icon, fields, sub } = sectionMap[category];
    return (
      <AccordionSection title={category} icon={icon} subcategory={sub}>
        {fields}
      </AccordionSection>
    );
  }

  return null;
};

export default CategorySpecificFields;