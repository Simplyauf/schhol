import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  major: string;
  dateOfBirth: string;
  gpa: number;
}

interface EditStudentModalProps {
  isOpen: boolean;
  closeModal: () => void;
  student: Student;
  onSave: (updatedStudent: Student) => void;
}

export default function EditStudentModal({
  isOpen,
  closeModal,
  student,
  onSave,
}: EditStudentModalProps) {
  const [editedStudent, setEditedStudent] = useState<Student>(student);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "gpa" ? parseFloat(e.target.value) : e.target.value;
    setEditedStudent({ ...editedStudent, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!student._id) {
      setError("Student ID is missing");
      return;
    }

    try {
      const { ...updateData } = editedStudent;

      const response = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      const updatedStudent = await response.json();
      onSave(updatedStudent);
      closeModal();
    } catch (error) {
      console.error("Error updating student:", error);
      setError("Failed to update student. Please try again.");
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-semibold leading-6 text-gray-900 mb-6"
                >
                  Edit Student Information
                </Dialog.Title>
                {error && (
                  <div className="mb-4 text-red-600 bg-red-100 p-3 rounded">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={editedStudent.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="registrationNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      id="registrationNumber"
                      value={editedStudent.registrationNumber}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="major"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Major
                    </label>
                    <input
                      type="text"
                      name="major"
                      id="major"
                      value={editedStudent.major}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={editedStudent.dateOfBirth}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="gpa"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      GPA
                    </label>
                    <input
                      type="number"
                      name="gpa"
                      id="gpa"
                      value={editedStudent.gpa}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      max="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-black/70  transition-colors duration-200"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
