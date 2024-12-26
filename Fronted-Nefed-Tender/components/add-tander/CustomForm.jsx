// components/AddTender/CustomFormBuilder.js
import React from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const CustomFormBuilder = ({ formFields, onDragEnd, renderField, initialFields }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {/* Form Fields Area */}
      <Droppable droppableId="formFields">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex-1 border-2 border-dashed border-gray-400 p-4 rounded-lg min-h-[400px] h-auto"
          >
            <h2 className="text-lg font-semibold mb-4">
              Create Forms
            </h2>
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              {formFields.length === 0 && (
                <p>Drag a field from the right to this area</p>
              )}
              {formFields.map((field, index) => (
                <div key={index} className="w-full">
                  {renderField(field, index)}
                </div>
              ))}
              {provided.placeholder}
            </div>
          </div>
        )}
      </Droppable>

      {/* Options List */}
      <Droppable droppableId="fields" isDropDisabled={true}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="w-64 bg-white border border-gray-300 rounded-lg shadow-md p-4"
          >
            {initialFields.map((field, index) => (
              <Draggable
                key={field.id}
                draggableId={field.id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-gray-50 p-2 mb-2 border border-gray-300 rounded-lg cursor-pointer"
                  >
                    {field.content}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CustomFormBuilder;
