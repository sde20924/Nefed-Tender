import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

/**
 * You had the logic for dragging items from a list of `initialFields`
 * into a "form fields" area. This is a simplified version.
 */
const CustomFormBuilder = ({
  formFields,
  setFormFields,
  initialFields,
  onDragEnd,
}) => {
  // Render each field
  const renderField = (field, index) => {
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            key={index}
            placeholder="Enter text"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "textfield":
        return (
          <input
            key={index}
            type="text"
            placeholder="Enter text"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "number":
        return (
          <input
            key={index}
            type="number"
            placeholder="Enter number"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "datefield":
        return (
          <input
            key={index}
            type="date"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        );
      case "checkboxgroup":
        return (
          <div key={index} className="mb-2">
            <label className="inline-flex items-center">
              <input type="checkbox" className="form-checkbox" />
              <span className="ml-2">Checkbox</span>
            </label>
          </div>
        );
      case "radiogroup":
        return (
          <div key={index} className="mb-2">
            <label className="inline-flex items-center">
              <input type="radio" name="radio" className="form-radio" />
              <span className="ml-2">Radio</span>
            </label>
          </div>
        );
      case "select":
        return (
          <select
            key={index}
            className="w-full p-2 border border-gray-300 rounded mb-2"
          >
            <option>Select option</option>
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex p-6 space-x-6">
      {/* Left side: the form area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="formFields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex-1 border-2 border-dashed border-gray-400 p-4 rounded-lg min-h-[400px] h-auto"
            >
              <h2 className="text-lg font-semibold mb-4">Create Forms</h2>
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

        {/* Right side: the fields list */}
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
    </div>
  );
};

export default CustomFormBuilder;
