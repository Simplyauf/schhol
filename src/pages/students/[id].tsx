import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import EditStudentModal from "Components/EditStudentModal";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  major: string;
  dateOfBirth: string;
  gpa: number;
}

interface StudentDetailProps {
  student: Student | null;
  error?: string;
}

export default function StudentDetail({ student, error }: StudentDetailProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(student);

  useEffect(() => {
    if (error === "Unauthorized") {
      toast.error("Please log in to view student details");
      router.push("/auth/signin");
    }
  }, [error, router]);

  if (error || !student)
    return <div>Error: {error || "Student not found"}</div>;

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleOnStudentUpdated = async () => {
    try {
      const res = await fetch(`/api/students/${student._id}`);
      if (res.ok) {
        const updatedStudent = await res.json();
        setCurrentStudent(updatedStudent);
      } else {
        console.error("Failed to fetch updated student data");
      }
    } catch (error) {
      console.error("Error fetching updated student data:", error);
    } finally {
      closeEditModal();
    }
  };

  const handleDeleteStudent = async () => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`/api/students/${student._id}`, {
          method: "DELETE",
        });
        if (response.ok) {
          router.push("/students");
        } else {
          console.error("Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Student Details</h1>
      {currentStudent && (
        <div className="gap-5  grid lg:grid-cols-5 ">
          <div className="w-auto p-4 bg-gray-200 rounded shadow-lg">
            <p>
              <strong>Name</strong>
              <br /> {currentStudent.name}
            </p>
          </div>
          <div className="w-auto p-4 bg-gray-200 rounded shadow-lg">
            <p>
              <strong>Registration Number</strong>
              <br />
              {currentStudent.registrationNumber}
            </p>
          </div>
          <div className="w-auto p-4 bg-gray-200 rounded shadow-lg">
            <p>
              <strong>Major</strong> <br /> {currentStudent.major}
            </p>
          </div>
          <div className="w-auto p-4 bg-gray-200 rounded shadow-lg">
            <p>
              <strong>Date of Birth</strong> <br /> {currentStudent.dateOfBirth}
            </p>
          </div>
          <div className="w-auto p-4 bg-gray-200 rounded shadow-lg">
            <p>
              <strong>GPA</strong> <br /> {currentStudent.gpa}
            </p>
          </div>
        </div>
      )}
      <div className="mt-10 space-x-2">
        <button
          onClick={openEditModal}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Edit
        </button>
        <button
          onClick={handleDeleteStudent}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
        <Link href="/students">
          <span className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer">
            Back to List
          </span>
        </Link>
      </div>
      <EditStudentModal
        isOpen={isEditModalOpen}
        closeModal={closeEditModal}
        student={student}
        onSave={handleOnStudentUpdated}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error("Fetch request timed out");
      controller.abort();
    }, 15000);

    console.log(`Fetching student data for ID: ${params?.id}`);

    const res = await fetch(
      `http://localhost:3000/api/students/${params?.id}`,
      {
        signal: controller.signal,
        headers: {
          Cookie: req.headers.cookie || "",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Failed to fetch student: ${res.statusText}`);
      return { props: { student: null, error: "Failed to fetch student" } };
    }

    const student: Student = await res.json();

    console.log(
      `Successfully fetched student data: ${JSON.stringify(student)}`
    );

    return {
      props: { student },
    };
  } catch (error) {
    console.error("Error fetching student data:", error);
    if (error instanceof Error && error.name === "AbortError") {
      return { props: { student: null, error: "Request timed out" } };
    }
    return { props: { student: null, error: "Failed to load student data" } };
  }
};
