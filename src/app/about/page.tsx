'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-green-700 text-white p-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-green-600 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold">About Basis Tracker</h1>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* What is Basis */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">What is Basis?</h2>
          <p className="text-gray-600 leading-relaxed">
            Basis is the difference between the local cash price and the futures price for a commodity.
            It&apos;s expressed in cents per bushel.
          </p>
          <div className="mt-3 bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium">
              Cash Price = Futures Price + Basis
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Example: If December corn futures are $4.50 and your local elevator has a basis of -25¢,
              the cash price is $4.25/bushel.
            </p>
          </div>
        </section>

        {/* Why Track Basis */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Why Track Basis?</h2>
          <ul className="text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>Compare prices across elevators in your area</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>Spot trends - basis often strengthens or weakens seasonally</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>Make better marketing decisions on when and where to sell</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600">•</span>
              <span>Track your local market over time</span>
            </li>
          </ul>
        </section>

        {/* How to Use */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How to Use This App</h2>
          <ol className="text-gray-600 space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">1</span>
              <span>Enter your ZIP code to find nearby grain elevators</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">2</span>
              <span>Select a facility and view current basis and trends</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">3</span>
              <span>Submit basis reports when you get quotes from elevators</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium">4</span>
              <span>Save your favorite locations for quick access</span>
            </li>
          </ol>
        </section>

        {/* Crowdsourced */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Crowdsourced Data</h2>
          <p className="text-gray-600 leading-relaxed">
            This app relies on farmers like you to submit basis reports. The more people contribute,
            the more useful the data becomes for everyone. All submissions are anonymous.
          </p>
        </section>

        {/* Futures Months */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Futures Month Codes</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-medium">H</span> - March
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-medium">K</span> - May
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-medium">N</span> - July
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-medium">U</span> - September
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="font-medium">Z</span> - December
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-white">
        <Link
          href="/"
          className="block w-full text-center bg-green-600 text-white py-4 rounded-lg font-semibold"
        >
          Start Tracking
        </Link>
      </div>
    </div>
  )
}
