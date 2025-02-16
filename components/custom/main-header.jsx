import NavLink from "./nav-link";

export default function MainNavHeader() {
  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="text-lg font-semibold">Gym App</div>
      <nav className="container mx-auto flex items-center justify-between p-4">
        <ul className="flex space-x-4">
          <li>
            <NavLink href="/manage-users">Gerencias Alunos</NavLink>
          </li>
          <li>
            <NavLink href="/manage-plans">Gerenciar Treinos</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
