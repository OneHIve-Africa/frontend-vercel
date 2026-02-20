import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import "../../settings/components/TermsAndConditionsModal.css";
import tcRaw from "../../settings/components/tc.txt?raw";

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const parseTcText = (text: string): Section[] => {
  const sections = text.trim().split(/\n\n(?=\d+\. )/);
  return sections.map((sectionText) => {
    const lines = sectionText.split("\n");
    const title = lines[0];
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const content = (
      <div className="space-y-4">
        {lines.slice(1).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
    return { id, title, content };
  });
};

interface AuthTermsModalProps {
  onClose: () => void;
  onAccept: () => void;
}

const AuthTermsModal: React.FC<AuthTermsModalProps> = ({ onClose, onAccept }) => {
  const [activeSection, setActiveSection] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const sections = parseTcText(tcRaw);

  useEffect(() => {
    setActiveSection(sections[0]?.id || "");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: contentRef.current,
        threshold: 0.1,
        rootMargin: "-30% 0px -65% 0px",
      }
    );

    const currentRefs = sectionRefs.current.filter(
      (ref) => ref !== null
    ) as HTMLDivElement[];
    currentRefs.forEach((ref) => observer.observe(ref));

    return () => {
      currentRefs.forEach((ref) => observer.unobserve(ref));
    };
  }, []);

  const handleNavClick = (id: string) => {
    const sectionElement = document.getElementById(id);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg overflow-hidden shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10"
        >
          <X size={24} />
        </button>

        <div className="flex-grow flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-1/4 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
            <nav>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavClick(section.id);
                      }}
                      className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeSection === section.id
                          ? "text-orange-600"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main
            ref={contentRef}
            className="w-3/4 p-8 overflow-y-auto scroll-smooth custom-scrollbar"
          >
            <div className="prose max-w-none">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Terms and Conditions for Investors
              </h1>
              <p className="text-sm text-gray-500 mb-8">
                Agreement Between One Hive Africa and Investors
              </p>
              <div className="space-y-8 pb-[30vh]">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    id={section.id}
                    ref={(el) => {
                      sectionRefs.current[index] = el;
                    }}
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>

        <div className="p-4 border-t flex items-center justify-end gap-3 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={() => {
              onAccept();
              onClose();
            }}
            className="px-5 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthTermsModal;
