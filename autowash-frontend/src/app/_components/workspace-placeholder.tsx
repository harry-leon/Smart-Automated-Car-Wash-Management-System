import Link from "next/link";

type WorkspacePlaceholderProps = {
  workspace: "Customer" | "Staff" | "Admin" | "Auth";
  title: string;
  description: string;
  endpoints?: string[];
  links?: Array<{
    href: string;
    label: string;
  }>;
};

export function WorkspacePlaceholder({
  workspace,
  title,
  description,
  endpoints = [],
  links = []
}: WorkspacePlaceholderProps) {
  return (
    <main style={{ padding: 24 }}>
      <section
        style={{
          margin: "0 auto",
          maxWidth: 960,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
          background: "#fff"
        }}
      >
        <p style={{ margin: 0, color: "#6b7280", fontSize: 12, textTransform: "uppercase" }}>
          {workspace}
        </p>
        <h1 style={{ margin: "12px 0 8px", fontSize: 32 }}>{title}</h1>
        <p style={{ margin: 0, color: "#374151" }}>{description}</p>

        {endpoints.length > 0 ? (
          <div style={{ marginTop: 20 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>API contract</h2>
            <ul style={{ margin: 0, paddingLeft: 20, color: "#374151" }}>
              {endpoints.map((endpoint) => (
                <li key={endpoint}>
                  <code>{endpoint}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {links.length > 0 ? (
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
