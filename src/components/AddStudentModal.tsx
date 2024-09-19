import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface StudentFormData {
  name: string;
  registrationNumber: string;
  major: string;
  dateOfBirth: string;
  gpa: string;
}

interface AddStudentModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onStudentAdded?: (newStudent: StudentFormData) => void;
}

export default function AddStudentModal({
  isOpen,
  closeModal,
  onStudentAdded,
}: AddStudentModalProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    registrationNumber: "",
    major: "",
    dateOfBirth: "",
    gpa: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          gpa: parseFloat(formData.gpa),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add student: ${response.statusText}`);
      }

      const newStudent = await response.json();
      if (onStudentAdded) {
        onStudentAdded(newStudent);
      }
      closeModal();
      setFormData({
        name: "",
        registrationNumber: "",
        major: "",
        dateOfBirth: "",
        gpa: "",
      });
    } catch (error) {
      console.error("Error adding student:", error);
      setError("An error occurred while adding the student.");
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
                  Add New Student
                </Dialog.Title>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
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
                        id="registrationNumber"
                        name="registrationNumber"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        required
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
                        id="major"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        required
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
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
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
                        id="gpa"
                        name="gpa"
                        value={formData.gpa}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="4"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md bg-black/70 transition-colors duration-200"
                    >
                      Add Student
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
