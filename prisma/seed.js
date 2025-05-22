"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var adminPassword, admin, secretariaPassword, secretaria, gestorPassword, gestor, professorPassword, professor, alunoPassword, aluno, escolas, _i, escolas_1, escola;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Limpa o banco de dados
                return [4 /*yield*/, prisma.school.deleteMany()];
                case 1:
                    // Limpa o banco de dados
                    _a.sent();
                    return [4 /*yield*/, prisma.secretaria.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.gestor.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.professor.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.aluno.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.account.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.session.deleteMany()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.verificationToken.deleteMany()];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, prisma.passwordReset.deleteMany()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("senha123", 12)];
                case 11:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "Administrador",
                                email: "admin@sigep.com",
                                password: adminPassword,
                                role: client_1.UserRole.ADMIN,
                            },
                        })];
                case 12:
                    admin = _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("senha123", 12)];
                case 13:
                    secretariaPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "Secretaria",
                                email: "secretaria@sigep.com",
                                password: secretariaPassword,
                                role: client_1.UserRole.SECRETARIA,
                                secretaria: {
                                    create: {
                                        departamento: "Educação",
                                        cargo: "Secretária",
                                    },
                                },
                            },
                        })];
                case 14:
                    secretaria = _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("senha123", 12)];
                case 15:
                    gestorPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "Gestor Escolar",
                                email: "gestor@sigep.com",
                                password: gestorPassword,
                                role: client_1.UserRole.GESTOR,
                                gestor: {
                                    create: {
                                        cargo: "Diretor",
                                    },
                                },
                            },
                        })];
                case 16:
                    gestor = _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("senha123", 12)];
                case 17:
                    professorPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "Professor",
                                email: "professor@sigep.com",
                                password: professorPassword,
                                role: client_1.UserRole.PROFESSOR,
                                professor: {
                                    create: {
                                        formacao: "Licenciatura em Matemática",
                                        especialidade: "Matemática",
                                    },
                                },
                            },
                        })];
                case 18:
                    professor = _a.sent();
                    return [4 /*yield*/, (0, bcryptjs_1.hash)("senha123", 12)];
                case 19:
                    alunoPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                name: "Aluno",
                                email: "aluno@sigep.com",
                                password: alunoPassword,
                                role: client_1.UserRole.ALUNO,
                                aluno: {
                                    create: {
                                        matricula: "2024001",
                                        dataNascimento: new Date("2000-01-01"),
                                        responsavel: "Responsável",
                                        telefone: "(11) 99999-9999",
                                        endereco: "Rua do Aluno, 123",
                                    },
                                },
                            },
                        })];
                case 20:
                    aluno = _a.sent();
                    escolas = [
                        {
                            name: "Escola Municipal João da Silva",
                            address: "Rua das Flores, 123",
                            city: "São Paulo",
                            state: "SP",
                            email: "joaodasilva@escola.com",
                            phone: "(11) 1111-1111",
                            website: "https://joaodasilva.com",
                        },
                        {
                            name: "Escola Estadual Maria Oliveira",
                            address: "Avenida Principal, 456",
                            city: "São Paulo",
                            state: "SP",
                            email: "mariaoliveira@escola.com",
                            phone: "(11) 2222-2222",
                            website: "https://mariaoliveira.com",
                        },
                        {
                            name: "Colégio Particular São José",
                            address: "Rua da Paz, 789",
                            city: "São Paulo",
                            state: "SP",
                            email: "saojose@escola.com",
                            phone: "(11) 3333-3333",
                            website: "https://saojose.com",
                        },
                        {
                            name: "Escola Técnica Federal",
                            address: "Avenida Tecnologia, 321",
                            city: "São Paulo",
                            state: "SP",
                            email: "tecnicafederal@escola.com",
                            phone: "(11) 4444-4444",
                            website: "https://tecnicafederal.com",
                        },
                        {
                            name: "Instituto de Educação Infantil",
                            address: "Rua das Crianças, 654",
                            city: "São Paulo",
                            state: "SP",
                            email: "infantil@escola.com",
                            phone: "(11) 5555-5555",
                            website: "https://infantil.com",
                        },
                    ];
                    _i = 0, escolas_1 = escolas;
                    _a.label = 21;
                case 21:
                    if (!(_i < escolas_1.length)) return [3 /*break*/, 24];
                    escola = escolas_1[_i];
                    return [4 /*yield*/, prisma.school.create({
                            data: escola,
                        })];
                case 22:
                    _a.sent();
                    _a.label = 23;
                case 23:
                    _i++;
                    return [3 /*break*/, 21];
                case 24:
                    console.log("Seed concluído com sucesso!");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error("Erro ao executar seed:", e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
