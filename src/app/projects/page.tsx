import Link from "next/link";
import projects from "@/../projects/projects.json";

export default function ProjectsPage() {
  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <p className="text-sm text-zinc-500">$ ls projects</p>
        <h1 className="text-2xl font-semibold text-zinc-100 md:text-3xl">Projects</h1>
      </div>

      <div className="space-y-5">
        {projects.map((project) => (
          <article key={project.name} className="border border-zinc-800 p-6">
            <div className="space-y-3">
              <h2 className="text-lg font-medium text-zinc-100">{project.name}</h2>
              <p className="text-sm leading-relaxed text-zinc-400">{project.description}</p>
              <p className="text-xs text-zinc-500">Stack: {project.stack.join(" · ")}</p>
              <Link
                href={project.github}
                target="_blank"
                className="inline-block text-sm text-zinc-300 transition-colors hover:text-zinc-100 hover:underline"
              >
                GitHub
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
