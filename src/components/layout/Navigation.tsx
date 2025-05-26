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
  Settings,
  User2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: "/gestor/turmas", label: "Turmas", icon: School, roles: [UserRole.GESTOR] },
  { href: "/gestor/disciplinas", label: "Disciplinas", icon: BookOpen, roles: [UserRole.GESTOR] },
  { href: "/gestor/professores", label: "Professores", icon: GraduationCap, roles: [UserRole.GESTOR] },
  { href: "/gestor/alunos", label: "Alunos", icon: Users, roles: [UserRole.GESTOR] },
  
  { href: "/professor/turmas", label: "Minhas Turmas", icon: School, roles: [UserRole.PROFESSOR] },
  { href: "/professor/alunos", label: "Meus Alunos", icon: Users, roles: [UserRole.PROFESSOR] },
  { href: "/professor/ocorrencias", label: "Ocorrências", icon: ClipboardList, roles: [UserRole.PROFESSOR] },
  
  { href: "/secretaria/alunos", label: "Alunos", icon: Users, roles: [UserRole.SECRETARIA] },
  { href: "/secretaria/matriculas", label: "Matrículas", icon: FileText, roles: [UserRole.SECRETARIA] },
  { href: "/secretaria/relatorios", label: "Relatórios", icon: ClipboardList, roles: [UserRole.SECRETARIA] },
  
  { href: "/admin/escolas", label: "Escolas", icon: School, roles: [UserRole.ADMIN] },
  { href: "/admin/turmas", label: "Turmas", icon: Users, roles: [UserRole.ADMIN] },
  { href: "/admin/professores", label: "Professores", icon: GraduationCap, roles: [UserRole.ADMIN] },
  { href: "/admin/alunos", label: "Alunos", icon: User2, roles: [UserRole.ADMIN] },
  { href: "/admin/usuarios", label: "Usuários", icon: Users, roles: [UserRole.ADMIN] },
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
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href={basePath} 
                className="flex items-center gap-2 text-xl font-bold text-blue-700 hover:opacity-90 transition-opacity"
              >
                <School className="w-6 h-6 text-blue-700" />
                <span className="text-base sm:text-xl">SIGEP</span>
                <span className="hidden sm:inline text-gray-500 font-normal ml-1">| {title}</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu Desktop */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-50">
              <UserCircle className="w-5 h-5 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">
                {session?.user?.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
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

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-base font-medium text-gray-900">
                <School className="w-5 h-5 text-blue-700" />
                <span>SIGEP</span>
                <span className="text-gray-500 font-normal">| {title}</span>
              </div>
            </div>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div className="border-t border-gray-100 mt-2 pt-2 space-y-1">
                <div className="flex items-center px-4 py-3 text-blue-700 bg-blue-50 rounded-lg">
                  <UserCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{session?.user?.name}</span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 