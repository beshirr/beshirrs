import Link from "next/link";

const contacts = [
  { label: "Email", value: "youssefahmedbeshir@gmail.com", href: "mailto:youssefahmedbeshir@gmail.com" },
  { label: "GitHub", value: "github.com/beshirr", href: "https://github.com/beshirr" },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/yabeshir",
    href: "https://linkedin.com/in/yabeshir"
  },
  {
    label: "Medium",
    value: "medium.com/@beshirr",
    href: "https://medium.com/@beshirr"
  }
];

export default function ContactPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">$ cat contact.txt</p>
        <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">Contact</h1>
      </div>

      <ul className="space-y-4">
        {contacts.map((item) => (
          <li key={item.label} className="text-zinc-300">
            <span className="mr-3 text-zinc-500">{item.label}:</span>
            <Link
              href={item.href}
              target="_blank"
              className="transition-colors hover:text-zinc-100 hover:underline"
            >
              {item.value}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
