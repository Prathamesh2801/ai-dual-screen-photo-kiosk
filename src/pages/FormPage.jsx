import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiArrowRight,
  FiBriefcase,
  FiMail,
  FiRotateCcw,
  FiUser,
} from "react-icons/fi";
import Button from "../components/ui/Button";
import Heading from "../components/ui/Heading";
import { ROUTES } from "../utils/constants";
import { clearSession, loadSession, saveSession } from "../utils/session";

const EMPTY = { name: "", email: "", company: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function firstError({ name, email, company }) {
  if (name.trim().length < 2) return "Please enter your name.";
  if (!EMAIL_RE.test(email.trim()))
    return "Please enter a valid email address.";
  if (!company.trim()) return "Please enter your company name.";
  return null;
}

const FIELDS = [
  {
    key: "name",
    label: "Name",
    Icon: FiUser,
    type: "text",
    autoComplete: "name",
    autoCapitalize: "words",
    placeholder: "ABC",
  },
  {
    key: "email",
    label: "Email ID",
    Icon: FiMail,
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    autoCapitalize: "none",
    placeholder: "abc@company.com",
  },
  {
    key: "company",
    label: "Company Name",
    Icon: FiBriefcase,
    type: "text",
    autoComplete: "organization",
    autoCapitalize: "words",
    placeholder: "ABC Inc.",
  },
];

export default function FormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...loadSession().form }));

  const update = (key, raw) => {
    const next = { ...form, [key]: raw };
    setForm(next);
    saveSession({ form: next });
  };

  // A new guest: drops the whole session, not just these fields.
  const clear = () => {
    clearSession();
    setForm(EMPTY);
    toast.success("Details cleared", { id: "form" });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const error = firstError(form);
    if (error) return toast.error(error, { id: "form" });
    saveSession({
      form: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
      },
    });
    navigate(ROUTES.template);
  };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto flex w-full max-w-3xl flex-col items-center"
    >
      <Heading title="Enter your details">
        Tell us who you are, then pick your frame.
      </Heading>

      <div className="reveal-cover mt-8 w-full space-y-4 sm:mt-12 sm:space-y-5">
        {FIELDS.map(({ key, label, Icon, ...input }) => (
          <label
            key={key}
            className="grid gap-1.5 sm:grid-cols-[15rem_1fr] sm:gap-3"
          >
            <span className="flex items-center gap-2 text-sm font-medium tracking-wide text-white/80 uppercase sm:gap-3 sm:rounded-xl sm:bg-white sm:px-5 sm:text-xl sm:tracking-normal sm:text-ink sm:normal-case">
              <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5 sm:text-brand" />
              {label}
            </span>
            <input
              {...input}
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              enterKeyHint={key === "company" ? "done" : "next"}
              className="h-13 w-full rounded-xl bg-white px-4 text-lg text-ink shadow-soft outline-none placeholder:text-ink-soft/40 focus:ring-4 focus:ring-aqua/60 sm:h-16 sm:px-5 sm:text-2xl"
            />
          </label>
        ))}
      </div>

      <div className="reveal-actions mt-10 flex w-full justify-center gap-3 sm:mt-16 sm:w-auto sm:gap-4">
        <Button
          variant="ghost"
          size="xl"
          className="flex-1 sm:flex-none"
          onClick={clear}
          disabled={!Object.values(form).some(Boolean)}
        >
          <FiRotateCcw /> Clear
        </Button>
        <Button
          type="submit"
          size="xl"
          className="flex-1 sm:min-w-60 sm:flex-none"
        >
          Next <FiArrowRight />
        </Button>
      </div>
    </form>
  );
}
