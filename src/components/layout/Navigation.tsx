import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  School,
  LogOut,
  UserCircle,
  Menu,
  X,
  ClipboardList,
  FileText,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/gestor", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.GESTOR] },
  { href: "/gestor/turmas", label: "Turmas", icon: School, roles: [UserRole.GESTOR] },
  { href: "/gestor/disciplinas", label: "Disciplinas", icon: BookOpen, roles: [UserRole.GESTOR] },
  { href: "/gestor/professores", label: "Professores", icon: GraduationCap, roles: [UserRole.GESTOR] },
  { href: "/gestor/alunos", label: "Alunos", icon: Users, roles: [UserRole.GESTOR] },
  
  { href: "/professor", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.PROFESSOR] },
  { href: "/professor/turmas", label: "Minhas Turmas", icon: School, roles: [UserRole.PROFESSOR] },
  { href: "/professor/alunos", label: "Meus Alunos", icon: Users, roles: [UserRole.PROFESSOR] },
  { href: "/professor/ocorrencias", label: "Ocorrências", icon: ClipboardList, roles: [UserRole.PROFESSOR] },
  
  { href: "/secretaria", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.SECRETARIA] },
  { href: "/secretaria/alunos", label: "Alunos", icon: Users, roles: [UserRole.SECRETARIA] },
  { href: "/secretaria/matriculas", label: "Matrículas", icon: FileText, roles: [UserRole.SECRETARIA] },
  { href: "/secretaria/relatorios", label: "Relatórios", icon: ClipboardList, roles: [UserRole.SECRETARIA] },
  
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: [UserRole.ADMIN] },
  { href: "/admin/escolas", label: "Escolas", icon: School, roles: [UserRole.ADMIN] },
  { href: "/admin/professores", label: "Professores", icon: GraduationCap, roles: [UserRole.ADMIN] },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, roles: [UserRole.ADMIN] },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings, roles: [UserRole.ADMIN] },
];

interface NavigationProps {
  role: UserRole;
  basePath: string;
  title: string;
}

export function Navigation({ role, basePath, title }: NavigationProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== role) {
      router.push("/dashboard");
    }
  }, [status, session, router, role]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  if (!session || session.user.role !== role) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === basePath) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href={basePath} 
                className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#3151A6] bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                <School className="w-6 h-6 text-[#1E3A8A]" />
                {title}
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#1E3A8A]"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-50">
                <UserCircle className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Sair
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-base font-medium",
                    isActive(item.href)
                      ? "bg-[#1E3A8A]/10 text-[#1E3A8A]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-[#1E3A8A]"
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="flex items-center px-3 py-2 text-gray-600">
                <UserCircle className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center w-full px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-[#1E3A8A] rounded-md"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 