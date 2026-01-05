'use client';

import { useState } from 'react';
import { CustomerVehicleType, EvacuatorAnswers, ServiceVehicleType } from '@/lib/types';

interface EvacuatorQuestionnaireProps {
  vehicleType: CustomerVehicleType;
  onComplete: (answers: EvacuatorAnswers, serviceType: ServiceVehicleType) => void;
  onBack: () => void;
}

interface Question {
  key: keyof EvacuatorAnswers;
  text: string;
}

// Questions for different vehicle types
const SEDAN_SUV_QUESTIONS: Question[] = [
  { key: 'wheelLocked', text: 'საბურავი დაბლოკილია?' },
  { key: 'steeringLocked', text: 'საჭე დაბლოკილია?' },
  { key: 'goesNeutral', text: 'ვარდება ნეიტრალში?' },
];

const MINIBUS_QUESTIONS: Question[] = [
  { key: 'wheelLocked', text: 'საბურავი დაბლოკილია?' },
  { key: 'steeringLocked', text: 'საჭე დაბლოკილია?' },
];

// Determine service vehicle type based on answers
function determineServiceVehicleType(
  vehicleType: CustomerVehicleType,
  answers: EvacuatorAnswers
): ServiceVehicleType {
  // SEDAN or SUV
  if (vehicleType === 'SEDAN' || vehicleType === 'SUV') {
    if (answers.wheelLocked || answers.steeringLocked || answers.goesNeutral === false) {
      return 'SPIDER'; // Needs hydraulic lift
    }
    return 'STANDARD'; // Can use regular tow
  }

  // MINIBUS
  if (vehicleType === 'MINIBUS') {
    if (answers.wheelLocked || answers.steeringLocked) {
      return 'HEAVY_MANIPULATOR'; // Needs heavy manipulator
    }
    return 'LONG_BED'; // Can use long bed
  }

  // CONSTRUCTION
  if (vehicleType === 'CONSTRUCTION') {
    return 'LOWBOY';
  }

  // MOTO
  if (vehicleType === 'MOTO') {
    return 'MOTO_CARRIER';
  }

  // SPORTS CAR
  if (vehicleType === 'SPORTS') {
    return 'SPIDER';
  }

  return 'STANDARD';
}

// Check if vehicle type needs questionnaire
export function needsQuestionnaire(vehicleType: CustomerVehicleType): boolean {
  return vehicleType === 'SEDAN' || vehicleType === 'SUV' || vehicleType === 'MINIBUS';
}

// Get service type for vehicles that don't need questionnaire
export function getDirectServiceType(vehicleType: CustomerVehicleType): ServiceVehicleType {
  if (vehicleType === 'CONSTRUCTION') return 'LOWBOY';
  if (vehicleType === 'MOTO') return 'MOTO_CARRIER';
  if (vehicleType === 'SPORTS') return 'SPIDER';
  return 'STANDARD';
}

export default function EvacuatorQuestionnaire({
  vehicleType,
  onComplete,
  onBack,
}: EvacuatorQuestionnaireProps) {
  const [answers, setAnswers] = useState<EvacuatorAnswers>({});

  // Get questions based on vehicle type
  const questions = vehicleType === 'MINIBUS' ? MINIBUS_QUESTIONS : SEDAN_SUV_QUESTIONS;

  // Check if all questions are answered
  const allAnswered = questions.every((q) => answers[q.key] !== undefined);

  const handleAnswer = (key: keyof EvacuatorAnswers, value: boolean) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    const serviceType = determineServiceVehicleType(vehicleType, answers);
    onComplete(answers, serviceType);
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          შეავსეთ კითხვარი
        </h2>
        <p className="text-gray-500 text-sm">
          გთხოვთ უპასუხოთ კითხვებს სწორად შესაფერისი ევაკუატორის შესარჩევად
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.key}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
          >
            <p className="font-medium text-gray-800 mb-4">{question.text}</p>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAnswer(question.key, true)}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  ${answers[question.key] === true
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                დიახ
              </button>
              <button
                onClick={() => handleAnswer(question.key, false)}
                className={`
                  flex-1 py-3 px-4 rounded-lg font-medium transition-all
                  ${answers[question.key] === false
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                არა
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={!allAnswered}
        className={`
          w-full py-4 rounded-xl font-semibold text-white transition-all
          ${allAnswered
            ? 'bg-orange-500 hover:bg-orange-600 shadow-lg'
            : 'bg-gray-300 cursor-not-allowed'
          }
        `}
      >
        გაგრძელება
      </button>

      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mx-auto"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>უკან</span>
      </button>
    </div>
  );
}
