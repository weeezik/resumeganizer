import { ResumeList } from '@/components/ResumeList'
import { UploadResume } from '@/components/UploadResume'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Resumeganizer</h1>
        
        <div className="grid gap-6">
          {/* Resume Categories */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Resume Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CategoryCard title="Software Developer" />
              <CategoryCard title="Product Manager" />
              <CategoryCard title="Travel/Farm Work/House Work" />
            </div>
          </section>

          {/* Add Category Button */}
          <section>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Add a Resume Category
            </button>
          </section>
        </div>
      </div>
    </main>
  )
}

function CategoryCard({ title }: { title: string }) {
  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
      <h3 className="font-medium">{title}</h3>
    </div>
  )
}
