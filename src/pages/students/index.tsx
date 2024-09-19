import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AddButton } from "Components/AddButton";
import { ClipLoader } from "react-spinners";
import ResponsiveTableWrapper from "Components/tableWrapper";
import EditStudentModal from "Components/EditStudentModal";
import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import AddStudentModal from "@/components/AddStudentModal";
import { getSession, useSession } from "next-auth/react";

interface Student {
  _id: string;
  name: string;
  registrationNumber: string;
  major: string;
  dateOfBirth: string;
  gpa: number;
}

interface Filters {
  searchTerm: string;
  majorFilter: string;
  gpaFilter: string;
}

const columns = [
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Registration Number",
    accessor: "registrationNumber",
  },
  {
    header: "Major",
    accessor: "major",
  },
  {
    header: "Action",
    accessor: "",
  },
];

export default function StudentListPage({
  initialStudents,
}: {
  initialStudents: Student[];
}) {
  const [students, setStudents] = useState<Student[]>(initialStudents || []);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: "",
    majorFilter: "",
    gpaFilter: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({
    searchTerm: "",
    majorFilter: "",
    gpaFilter: "",
  });

  const filteredStudents = students.filter((student) => {
    const nameMatch = student.name
      .toLowerCase()
      .includes(appliedFilters.searchTerm.toLowerCase());
    const majorMatch =
      !appliedFilters.majorFilter ||
      student.major === appliedFilters.majorFilter;
    const gpaMatch =
      !appliedFilters.gpaFilter ||
      student.gpa >= parseFloat(appliedFilters.gpaFilter);
    return nameMatch && majorMatch && gpaMatch;
  });

  const uniqueMajors = React.useMemo(() => {
    return [...new Set(students.map((student) => student.major))];
  }, [students]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <ClipLoader />;
  }

  if (!session) {
    return null;
  }

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStudent(null);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleOnStudentAdded = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/students");
      if (response.ok) {
        const updatedStudents: Student[] = await response.json();
        setStudents(updatedStudents);
      } else {
        console.error("Failed to fetch updated student list");
      }
    } catch (error) {
      console.error("Error fetching updated student list:", error);
    } finally {
      setLoading(false);
      closeAddModal();
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        const response = await fetch(`/api/students/${studentId}`, {
          method: "DELETE",
        });
        if (response.ok) {
          setStudents(students.filter((student) => student._id !== studentId));
        } else {
          console.error("Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  return (
    <>
      {selectedStudent && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          closeModal={closeEditModal}
          student={selectedStudent}
          onSave={handleOnStudentAdded}
        />
      )}
      <AddStudentModal
        isOpen={isAddModalOpen}
        closeModal={closeAddModal}
        onStudentAdded={handleOnStudentAdded}
      />
      <div className="px-5 pt-8 md:px-8">
        {!loading ? (
          <>
            <div className="rounded bg-brownMainBG">
              <div className="item-center mb-3 flex w-full justify-between">
                <h4 className="text-[16px] font-semibold md:text-xl">
                  Students
                </h4>
                <div className="flex">
                  <AddButton
                    onClick={openAddModal}
                    className={"!px-6 !py-4 font-medium"}
                  />
                </div>
              </div>
              <div className="mb-6 lg:max-w-2xl grid gap-4 md:grid-cols-4">
                <input
                  placeholder="Search by name"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="appearance-none relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                />
                <select
                  name="majorFilter"
                  value={filters.majorFilter}
                  onChange={handleFilterChange}
                  className="appearance-auto relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                >
                  <option value="">All Majors</option>
                  {uniqueMajors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Min GPA"
                  name="gpaFilter"
                  value={filters.gpaFilter}
                  onChange={handleFilterChange}
                  className="appearance-none relative block w-full px-3 py-2 h-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none rounded sm:text-sm"
                  min="0"
                  max="4"
                  step="0.1"
                />
                <button
                  onClick={applyFilters}
                  className="group relative w-full flex justify-center items-center px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-black/70 focus:outline-none "
                >
                  Apply Filters
                </button>
              </div>
              <div className="mt-10 overflow-x-auto rounded bg-brownMainBG p-5 px-0 md:mt-8">
                <div className="mb-3 flex w-full items-center justify-between text-center">
                  <h4 className="text-[16px] font-[600] sm:text-[20px]">
                    Student List
                  </h4>
                  <div className="flex"></div>
                </div>
                <ResponsiveTableWrapper>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#1f1d1a]/10">
                      <thead>
                        <tr>
                          {columns.map((column, i) => (
                            <th
                              key={i}
                              scope="col"
                              className="font whitespace-nowrap border-b-[#1f1d1a]/10 px-4 text-left font-[700] md:border-0 md:border-b-[3px] md:border-dashed md:px-6 md:py-3"
                            >
                              {column.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="font-regular divide-y divide-[#1f1d1a]/10">
                        {filteredStudents.map((student) => (
                          <tr key={student._id} className="md:h-[60px]">
                            <td className="whitespace-nowrap px-3 md:max-w-lg md:whitespace-normal md:px-6 md:py-6">
                              {student.name}
                            </td>
                            <td className="whitespace-nowrap px-3 md:max-w-lg md:whitespace-normal md:px-6 md:py-6">
                              {student.registrationNumber}
                            </td>
                            <td className="whitespace-nowrap px-3 md:max-w-lg md:whitespace-normal md:px-6 md:py-6">
                              {student.major}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="flex h-auto items-center gap-2 sm:h-[60px] sm:justify-center">
                                <Link
                                  href={`/students/${student._id}`}
                                  className="font-regular cursor-pointer text-sm underline hover:underline"
                                >
                                  View
                                </Link>
                                <button
                                  onClick={() => openEditModal(student)}
                                  className="font-regular cursor-pointer text-sm underline hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteStudent(student._id)
                                  }
                                  className="font-regular cursor-pointer text-sm underline hover:underline text-red-600"
                                >
                                  Delete
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResponsiveTableWrapper>
              </div>
            </div>
          </>
        ) : (
          <ClipLoader />
        )}
      </div>
    </>
  );
}

export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<
  GetServerSidePropsResult<{ initialStudents: Student[]; session: unknown }>
> {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // Fetch initial students data
  const res = await fetch("http://localhost:3000/api/students", {
    headers: {
      Cookie: context.req.headers.cookie || "",
    },
  });

  if (res.status === 401) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const initialStudents: Student[] = await res.json();

  return {
    props: {
      initialStudents,
      session,
    },
  };
}
