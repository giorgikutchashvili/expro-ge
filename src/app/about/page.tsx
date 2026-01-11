import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-[480px] mx-auto p-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-400 hover:text-slate-300 transition-colors mb-6"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          მთავარი
        </Link>

        <h1 className="text-lg font-semibold text-white mb-6">ჩვენ შესახებ</h1>

        <div className="space-y-6 text-sm text-slate-400">
          <p>
            EXPRO.GE აკავშირებს მომხმარებლებს სერვისის მიმწოდებლებთან.
          </p>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">სერვისები:</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ტვირთის გადაზიდვა</li>
              <li>ევაკუატორი</li>
              <li>ამწე ლიფტი</li>
            </ul>
          </div>

          <p>
            ჩვენ ვართ შუამავალი პლატფორმა. მომსახურებას ახორციელებენ დამოუკიდებელი შემსრულებლები.
          </p>
        </div>
      </div>
    </div>
  );
}
