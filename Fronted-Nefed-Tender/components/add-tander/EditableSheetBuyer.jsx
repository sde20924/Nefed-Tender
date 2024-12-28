import React from 'react';

const EditableSheet = () => {
  const data = {
    header: ["S.No", "Item", "Item Description", "UOM", "Total Qty", "Rate"],
    tender: [
      {
        id: 1,
        name: "Civil & MS works",
        rows: [
          [
            1.1,
            "Brick Work for Counter and Steps",
            "Providing and laying 230 thk. brick work in super structure of any thickness...",
            "Cum",
            8.416615,
            8.42
          ],
          [
            1.2,
            "Half Brick Work",
            "115 THICK BRICK WORK...",
            "Sqm",
            12.1225,
            12.12
          ],
          [
            1.3,
            "Plaster",
            "PLASTER 12 MM...",
            "Sqm",
            97.43191304,
            "RO"
          ]
        ]
      },
      {
        id: 2,
        name: "FLOORING WORKS",
        rows: [
          [2.1, "Tile Flooring", "Providing and laying Flooring...", "Sqm", 373.94, 373.94],
          [2.2, "Stone Flooring", "Providing and laying Stone Flooring...", "Sqm", 78.8541, 78.85],
          [2.3, "Patterned Stone Flooring", "Providing and laying Stone Flooring...", "Sqm", 76.21, 76.21],
          [2.4, "Stone Threshold", "Same as above, but for threshold upto 100mm Wide", "Rmt", 30, 30],
          [2.5, "100mm Tile Skirting", "Providing and fixing of 100mm high skirting...", "Rmt", 30, 30],
          [2.6, "Floor Screeding", "Providing and laying in position upto 50mm thick...", "Sqm", "", 647.62],
          [2.7, "Green Turf", "Providing and laying in position synthetic grass turf...", "Sqm", 118.62, 118.62],
          [2.8, "Floor Protection", "Providing and laying in position Floor Protection...", "Sqm", 373.94, 373.94]
        ]
      },
      {
        id: 3,
        name: "WALL FINISHING WORKS",
        rows: []
      },
      {
        id: 4,
        name: "CEILING FINISHING WORKS",
        rows: []
      },
      {
        id: 5,
        name: "GLAZING WORKS",
        rows: []
      },
      {
        id: 6,
        name: "COUNTER WORKS",
        rows: []
      },
      {
        id: 7,
        name: "Furniture",
        rows: []
      }
    ]
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Tender Data</h2>

      {data.tender.map((subTender, subTenderIndex) => (
        <div key={subTender.id} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {subTenderIndex + 1}. {subTender.name}
          </h3>

          {subTender.rows.length > 0 ? (
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  {data.header.map((header, index) => (
                    <th key={index} className="border px-4 py-2 text-left font-semibold text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subTender.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="odd:bg-gray-100 even:bg-white">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border px-4 py-2 text-gray-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600 italic">No rows available for this tender.</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default EditableSheet;
