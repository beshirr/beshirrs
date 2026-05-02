import Link from "next/link";

const quickLinks = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

export default function HomePage() {
  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm text-zinc-500">$ whoami</p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
          Youssef Ahmed Beshir
        </h1>
        <p className="max-w-2xl text-zinc-400">
          Software Engineer focused on systems / backend.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-zinc-500">$ ls sections</p>
        <ul className="space-y-3">
          {quickLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block text-zinc-300 transition-colors hover:text-zinc-100 hover:underline"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
