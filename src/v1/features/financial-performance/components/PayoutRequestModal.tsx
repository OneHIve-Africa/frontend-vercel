import React, { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import { CheckCircle2 } from "lucide-react";

type Investment = {
  interest_earned: string | number;
  interest_to_be_earned?: string | number;
};

type DestinationType = "mobile_money" | "bank";

type Props = {
  open: boolean;
  onClose: () => void;
  investments?: Investment[];
  onSubmit?: (payload: {
    amount: number;
    destinationType: DestinationType;
    destination: Record<string, string | undefined>;
  }) => Promise<void> | void;
};

const currency = (v: number) => `GHS ${v.toFixed(2)}`;

const PayoutRequestModal: React.FC<Props> = ({ open, onClose, investments = [], onSubmit }) => {
  const available = useMemo(
    () =>
      investments.reduce((sum, inv) => sum + Number(inv.interest_earned || 0), 0),
    [investments]
  );

  // Steps: 0 Amount, 1 Destination, 2 Review, 3 Success
  const [step, setStep] = useState(0);
  const [useFull, setUseFull] = useState(true);
  const [amount, setAmount] = useState<number>(available);
  const [destinationType, setDestinationType] = useState<DestinationType>("mobile_money");
  const [dest, setDest] = useState<Record<string, string>>({
    provider: "MTN",
    phone: "",
    account_name: "",
    bank_name: "",
    account_number: "",
  });
  const [busy, setBusy] = useState(false);

  const resetAndClose = () => {
    setStep(0);
    setUseFull(true);
    setAmount(available);
    setDestinationType("mobile_money");
    setDest({ provider: "MTN", phone: "", account_name: "", bank_name: "", account_number: "" });
    setBusy(false);
    onClose();
  };

  const canProceedAmount = available > 0 && (useFull || (!!amount && amount > 0 && amount <= available));
  const canProceedDestination = destinationType === "mobile_money"
    ? dest.phone.length >= 9 && dest.account_name.trim().length >= 2
    : dest.bank_name.trim().length >= 2 && dest.account_number.trim().length >= 6 && dest.account_name.trim().length >= 2;

  const handleConfirm = async () => {
    try {
      setBusy(true);
      const payload = {
        amount: useFull ? available : Number(amount || 0),
        destinationType,
        destination:
          destinationType === "mobile_money"
            ? { provider: dest.provider, phone: dest.phone, account_name: dest.account_name }
            : { bank_name: dest.bank_name, account_number: dest.account_number, account_name: dest.account_name },
      };
      if (onSubmit) await onSubmit(payload);
      // Fake async to illustrate success state
      await new Promise((r) => setTimeout(r, 700));
      setStep(3);
    } finally {
      setBusy(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-4">
      {["Amount", "Destination", "Review", "Done"].map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
            i <= step ? "bg-oha_secondary text-white" : "bg-gray-200 text-gray-600"
          }`}>
            {i + 1}
          </div>
          <span className={`text-xs ${i === step ? "text-gray-900" : "text-gray-500"}`}>{label}</span>
          {i < 3 && <div className={`w-8 h-0.5 ${i < step ? "bg-oha_secondary" : "bg-gray-200"}`}></div>}
        </div>
      ))}
    </div>
  );

  return (
    <Modal popupModal={open} setPopupModal={() => resetAndClose()} outClickCancel>
      <div className="w-[720px] max-w-[95vw]">
        <h2 className="text-xl font-semibold mb-1">Request Payout</h2>
        <p className="text-sm text-gray-500 mb-4">Withdraw your earnings to your preferred destination.</p>

        <StepIndicator />

        {step === 0 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Available to withdraw</span>
              <span className="text-lg font-semibold text-gray-900">{currency(available)}</span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="amt"
                  checked={useFull}
                  onChange={() => { setUseFull(true); setAmount(available); }}
                />
                <span>Full payout</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="amt"
                  checked={!useFull}
                  onChange={() => setUseFull(false)}
                />
                <span>Partial amount</span>
              </label>
              {!useFull && (
                <div className="pl-7">
                  <input
                    type="number"
                    value={amount ?? 0}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-56 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oha_primary"
                    min={0}
                    max={available}
                    step={0.01}
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: {currency(available)}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={resetAndClose} className="px-4 py-2 rounded-md border border-gray-300 cursor-pointer">Cancel</button>
              <button
                disabled={!canProceedAmount}
                onClick={() => setStep(1)}
                className={`px-4 py-2 rounded-md text-white cursor-pointer ${canProceedAmount ? "bg-oha_primary hover:opacity-95" : "bg-gray-400"}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <label className={`border rounded-md px-4 py-3 cursor-pointer ${destinationType === "mobile_money" ? "border-oha_secondary bg-green-50" : "border-gray-300"}`}>
                <input
                  type="radio"
                  name="dest"
                  className="hidden"
                  checked={destinationType === "mobile_money"}
                  onChange={() => setDestinationType("mobile_money")}
                />
                <div className="text-sm font-medium">Mobile Money</div>
                <div className="text-xs text-gray-500">MTN, Vodafone, AirtelTigo</div>
              </label>
              <label className={`border rounded-md px-4 py-3 cursor-pointer ${destinationType === "bank" ? "border-oha_secondary bg-green-50" : "border-gray-300"}`}>
                <input
                  type="radio"
                  name="dest"
                  className="hidden"
                  checked={destinationType === "bank"}
                  onChange={() => setDestinationType("bank")}
                />
                <div className="text-sm font-medium">Bank Transfer</div>
                <div className="text-xs text-gray-500">Any local bank</div>
              </label>
            </div>

            {destinationType === "mobile_money" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Provider</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={dest.provider}
                    onChange={(e) => setDest((d) => ({ ...d, provider: e.target.value }))}
                  >
                    <option>MTN</option>
                    <option>Vodafone</option>
                    <option>AirtelTigo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Phone number</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g. 0241234567"
                    value={dest.phone}
                    onChange={(e) => setDest((d) => ({ ...d, phone: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Account name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Full name"
                    value={dest.account_name}
                    onChange={(e) => setDest((d) => ({ ...d, account_name: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Bank name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g. GCB Bank"
                    value={dest.bank_name}
                    onChange={(e) => setDest((d) => ({ ...d, bank_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Account name</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Full name"
                    value={dest.account_name}
                    onChange={(e) => setDest((d) => ({ ...d, account_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Account number</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="e.g. 1234567890"
                    value={dest.account_number}
                    onChange={(e) => setDest((d) => ({ ...d, account_number: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(0)} className="px-4 py-2 rounded-md border border-gray-300 cursor-pointer">Back</button>
              <button
                disabled={!canProceedDestination}
                onClick={() => setStep(2)}
                className={`px-4 py-2 rounded-md text-white cursor-pointer ${canProceedDestination ? "bg-oha_primary hover:opacity-95" : "bg-gray-400"}`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">Review details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-medium">{currency(useFull ? available : amount)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="font-medium">{destinationType === "mobile_money" ? "Mobile Money" : "Bank Transfer"}</span></div>
                {destinationType === "mobile_money" ? (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-medium">{dest.provider}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{dest.phone}</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between"><span className="text-gray-500">Bank</span><span className="font-medium">{dest.bank_name}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Account No.</span><span className="font-medium">{dest.account_number}</span></div>
                  </>
                )}
                <div className="flex justify-between md:col-span-2"><span className="text-gray-500">Account name</span><span className="font-medium">{dest.account_name}</span></div>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-md border border-gray-300 cursor-pointer">Back</button>
              <button onClick={handleConfirm} disabled={busy} className={`px-4 py-2 rounded-md text-white cursor-pointer ${busy ? "bg-gray-400" : "bg-oha_secondary hover:opacity-95"}`}>{busy ? "Submitting..." : "Confirm Request"}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <CheckCircle2 className="w-14 h-14 text-oha_secondary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">Payout Request Submitted</h3>
            <p className="text-sm text-gray-600 mb-6">We\'re processing your request. You\'ll receive a confirmation shortly.</p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block text-left">
              <div className="text-sm"><span className="text-gray-500">Amount:</span> <span className="font-medium">{currency(useFull ? available : amount)}</span></div>
              <div className="text-sm"><span className="text-gray-500">Destination:</span> <span className="font-medium">{destinationType === "mobile_money" ? `${dest.provider} - ${dest.phone}` : `${dest.bank_name} - ${dest.account_number}`}</span></div>
            </div>
            <div className="mt-6">
              <button onClick={resetAndClose} className="px-5 py-2 rounded-md text-white bg-oha_primary hover:opacity-95 cursor-pointer">Close</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PayoutRequestModal;
