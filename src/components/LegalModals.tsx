import React from 'react';
import { X, Shield, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, type, onClose }) => {
  if (!isOpen || !type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#171A1C]/10 p-6 md:p-8 rounded-3xl max-h-[85vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#171A1C]/[0.08]">
          <div className="flex items-center gap-2.5 text-[#171A1C] font-display text-xl font-bold tracking-tight">
            {type === 'privacy' ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#15BCDF]/20 flex items-center justify-center text-[#15BCDF]">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Melofy Studio Privacy Policy</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-[#15BCDF]/20 flex items-center justify-center text-[#15BCDF]">
                  <FileText className="w-4 h-4" />
                </div>
                <span>Melofy Studio Terms of Service</span>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#6B6F72] hover:text-[#171A1C] rounded-full hover:bg-[#171A1C]/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="font-body text-xs md:text-sm text-[#6B6F72] space-y-4 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong className="text-[#171A1C]">1. Information We Collect:</strong> We only collect the story details, names, memories, and contact information you voluntarily submit to compose your bespoke song.
              </p>
              <p>
                <strong className="text-[#171A1C]">2. Confidentiality of Personal Stories:</strong> Personal stories, inside jokes, vows, and life events shared with Melofy remain 100% confidential to our production room and are never made public without your explicit consent.
              </p>
              <p>
                <strong className="text-[#171A1C]">3. Data Security:</strong> All client communications and audio masters are stored in secure studio repositories with strict access controls.
              </p>
              <p>
                <strong className="text-[#171A1C]">4. Your Rights:</strong> You may request complete deletion of your story brief or recordings from our storage at any time by contacting <span className="text-[#15BCDF] font-semibold">studio@melofy.com</span>.
              </p>
            </>
          ) : (
            <>
              <p>
                <strong className="text-[#171A1C]">1. Custom Song Commission:</strong> Melofy delivers original musical compositions and lyrics tailored to the specifications provided in your brief.
              </p>
              <p>
                <strong className="text-[#171A1C]">2. Delivery Timelines:</strong> Standard packages are delivered in a 3-day turnaround. Priority options deliver within 48–72 hours.
              </p>
              <p>
                <strong className="text-[#171A1C]">3. Creative Revisions:</strong> Each package tier includes dedicated revision rounds as specified. Revisions allow adjustments to lyrical phrasing, tempo, and mix balance.
              </p>
              <p>
                <strong className="text-[#171A1C]">4. Ownership & Rights:</strong> Personal packages include perpetual personal listening, gifting, and event playback rights. Standard and Premium tiers include commercial release & creator synchronization licenses.
              </p>
            </>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-[#171A1C]/[0.08] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-[#171A1C] text-white font-body text-xs font-semibold hover:bg-[#15BCDF] hover:text-[#171A1C] transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
