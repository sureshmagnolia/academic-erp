export const dynamic = 'force-dynamic';
import { getStudentDashboardData } from '@/app/actions/student';

export const runtime = 'edge';

// Hardcoded for demo
const STUDENT_ID = 'student_1';

export default async function StudentDashboard() {
  const { attendance, recentMarks, error } = await getStudentDashboardData(STUDENT_ID);

  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            BSc CS 2024
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Attendance Widget */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Attendance</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {attendance?.percentage}%
              </dd>
              <p className="mt-2 text-sm text-gray-500">
                {attendance?.present} hours present out of {attendance?.total} total hours.
              </p>
            </div>
          </div>

          {/* Recent Marks Widget */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Exam Results</h3>
              {recentMarks && recentMarks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentMarks.map((mark: any, idx: number) => (
                    <li key={idx} className="py-3 flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{mark.exam_name}</p>
                        <p className="text-xs text-gray-500">{mark.course_name}</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {mark.marks_obtained} / {mark.max_marks}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No recent exams.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
