import React, { useState } from "react";

const GenerateFormula = ({ headers, onSaveFormula }) => {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [formula, setFormula] = useState("");
  const [selectedHeaders, setSelectedHeaders] = useState([]);

  const handleHeaderSelect = (header) => {
    const identifierSequence = ["P", "R", "Q"];
    const nextIdentifier = identifierSequence[selectedHeaders.length];

    if (nextIdentifier) {
      setFormula((prev) => `${prev}${nextIdentifier}`);
      setSelectedHeaders((prev) => [...prev, { header, shortName: nextIdentifier }]);
      
    }
  };

  const handleOperationClick = (operation) => setFormula((prev) => `${prev}${operation}`);
  const handleClearFormula = () => {
    setFormula("");
    setSelectedHeaders([]);
  };

  const handleSaveFormula = () => {
    const data = { formula, headers: selectedHeaders };
    console.log("Sending formula data from GenerateFormula:", data); // Debug log
    if (onSaveFormula) {
      onSaveFormula(data);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setShowFormulaModal(true)}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Generate Formula
      </button>

      {showFormulaModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Generate Formula</h2>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Headers</h3>
              <div className="flex flex-wrap gap-2">
                {headers.map((header, index) => (
                  <button
                    key={index}
                    onClick={() => handleHeaderSelect(header)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded"
                  >
                    {header}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Operations</h3>
              <div className="flex space-x-2">
                {[1,2,3,4,5,6,7,8,9,0].map((operation) => (
                  <button
                    key={operation}
                    onClick={() => handleOperationClick(operation)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded"
                  >
                    {operation}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Operations</h3>
              <div className="flex space-x-2">
                {["+", "-", "*", "/", "="].map((operation) => (
                  <button
                    key={operation}
                    onClick={() => handleOperationClick(operation)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded"
                  >
                    {operation}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Formula</h3>
              <div className="p-2 border border-gray-300 rounded bg-gray-100">
                {formula || "Start creating your formula..."}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handleClearFormula}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
              >
                Clear
              </button>
              <div className="space-x-2">
                <button
                  onClick={() => setShowFormulaModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveFormula}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save Formula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default GenerateFormula;
