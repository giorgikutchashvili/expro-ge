import Link from 'next/link';

export default function PrivacyPage() {
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

        <h1 className="text-lg font-semibold text-white mb-6">კონფიდენციალურობა</h1>

        <div className="space-y-6 text-sm text-slate-400">
          <div>
            <h2 className="text-slate-300 font-medium mb-2">რა მონაცემებს ვაგროვებთ:</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>ტელეფონის ნომერი</li>
              <li>მისამართები</li>
              <li>გადახდის მეთოდი</li>
            </ul>
          </div>

          <div>
            <h2 className="text-slate-300 font-medium mb-2">როგორ ვიყენებთ:</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>შეკვეთის დამუშავება</li>
              <li>სერვისის მიწოდება</li>
            </ul>
          </div>

          <p>მონაცემები გადაეცემა მხოლოდ სერვისის შემსრულებელს.</p>

          <div className="pt-4 border-t border-slate-800">
            <p className="text-slate-500">
              კონტაქტი:{' '}
              <a href="mailto:exprogeo@gmail.com" className="text-slate-400 hover:text-slate-300">
                exprogeo@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
