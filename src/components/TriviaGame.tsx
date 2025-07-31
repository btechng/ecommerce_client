import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Decode HTML entities
const decodeHtml = (html: string): string => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

interface Question {
  question: string;
  correctAnswer: string;
  answers: string[];
}

const TriviaGame: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timer, setTimer] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && !showResult) {
      startTimer();
    }
    return () => stopTimer();
  }, [currentIndex, questions]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-server-or19.onrender.com/api/trivia/random?count=10"
      );
      const fetched: Question[] = res.data.map((q: any) => {
        const allAnswers = [...q.options].sort(() => 0.5 - Math.random());
        return {
          question: decodeHtml(q.question),
          correctAnswer: decodeHtml(q.correctAnswer),
          answers: allAnswers.map(decodeHtml),
        };
      });
      setQuestions(fetched);
    } catch (err) {
      toast.error("❌ Failed to fetch trivia questions");
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correctAnswer) {
      setScore((prev) => prev + 10);
      toast.success("✅ Correct!");
    } else {
      toast.error("❌ Wrong!");
    }

    stopTimer();
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const startTimer = () => {
    setTimer(10);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleAnswer("⏱️ Timeout");
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setSubmitted(false);
    fetchQuestions();
  };

  const handleSubmitScore = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("⚠️ Login to submit your score to the leaderboard");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        "https://ecommerce-server-or19.onrender.com/api/trivia/leaderboard",
        { score },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubmitted(true);
      toast.success("✅ Score submitted to leaderboard!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || "❌ Failed to submit your score"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 font-semibold text-lg">
        Loading trivia...
      </div>
    );
  }

  if (showResult) {
    const loggedIn = !!localStorage.getItem("token");

    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">🏆 Quiz Complete!</h2>
        <p className="text-xl">
          Your Score: {score}
          {score >= 100 && <span className="ml-2 inline-block">🏅</span>}
        </p>

        {score >= 100 ? (
          <p className="text-green-600 font-semibold text-lg mt-2">
            🎖️ Badge Earned: Trivia Master <span className="ml-1">🏅</span>
          </p>
        ) : (
          <p className="text-yellow-600 mt-2">
            💡 Score 100 to earn the Trivia Master badge
          </p>
        )}

        <button
          onClick={handleSubmitScore}
          disabled={submitting || !loggedIn || submitted}
          className={`mt-4 px-4 py-2 rounded text-white ${
            loggedIn
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting
            ? "Submitting..."
            : submitted
            ? "✅ Score Submitted"
            : loggedIn
            ? "📤 Submit Score to Leaderboard"
            : "🔒 Login to Submit Score"}
        </button>

        <button
          onClick={restartGame}
          className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔁 Play Again
        </button>
      </div>
    );
  }

  const current = questions[currentIndex];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="mb-2 text-sm text-right text-red-600 font-bold">
        ⏳ {timer}s
      </div>
      <h3 className="text-lg font-semibold mb-3">
        Question {currentIndex + 1} of {questions.length}
      </h3>
      <p className="mb-4 font-medium">{current.question}</p>
      <div className="space-y-3">
        {current.answers.map((answer, idx) => {
          const isCorrect = answer === current.correctAnswer;
          const isSelected = answer === selectedAnswer;
          const baseClass =
            selectedAnswer !== null
              ? isCorrect
                ? "bg-green-100 border-green-500"
                : isSelected
                ? "bg-red-100 border-red-500"
                : "bg-gray-100"
              : "hover:bg-blue-100";

          return (
            <button
              key={idx}
              disabled={!!selectedAnswer}
              onClick={() => handleAnswer(answer)}
              className={`block w-full text-left px-4 py-2 border rounded ${baseClass}`}
            >
              {answer}
            </button>
          );
        })}
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Score: {score}
      </div>
    </div>
  );
};

export default TriviaGame;
