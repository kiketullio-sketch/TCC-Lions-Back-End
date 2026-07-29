import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

dotenv.config();

import connectDB from "./config/db.js";
import authMiddleware from "./middleware/auth.js";
import requireRole from "./middleware/role.js";
import { isValidCPF, isValidCNPJ, isValidEmail } from "./utils/validators.js";

import createWorkshop from "./repository/workShop.repository/workshoopCreate.repository.js";
import updateWorkshop from "./repository/workShop.repository/workshopUptade.repository.js";
import deleteWorkshop from "./repository/workShop.repository/workshopDelete.repository.js";
import listarWorkshop from "./repository/workShop.repository/workshopRead.repository.js";

import createVeiculo from "./repository/veiculos.repository/veiculosCreate.repository.js";
import updateVeiculo from "./repository/veiculos.repository/veiculosPut.repository.js";
import deleteVeiculo from "./repository/veiculos.repository/veiculosDelete.repository.js";
import readVeiculo from "./repository/veiculos.repository/veiculosRead.repository.js";

import createMaintenance from "./repository/maintenance.repository/maintenanceCreate.repository.js";
import updateMaintenance from "./repository/maintenance.repository/maintenanceUpdate.repository.js";
import deleteMaintenance from "./repository/maintenance.repository/maintenanceDelete.repository.js";
import readMaintenance from "./repository/maintenance.repository/maintenanceRead.repository.js";

import createUser from "./repository/user.repository/userCreate.repository.js";
import updateUser from "./repository/user.repository/userUpdate.repository.js";
import deleteUser from "./repository/user.repository/userDelete.repository.js";
import MUser from "./db/User.js";
import MVeiculo from "./db/Veiculo.js";
import MMaintenance from "./db/Maintenance.js";
import MWorkshop from "./db/Workshop.js";

import createAdmin from "./repository/admin.repository/adminCreate.repository.js";
import deleteAdmin from "./repository/admin.repository/adminDelete.reposirory.js";
import updateAdmin from "./repository/admin.repository/adminUpdate.repository.js";
import MAdmin from "./db/Admin.js";
import MWorkshop from "./db/Workshop.js";

const app = express();
const DOOR = process.env.DOOR || 3000;

app.use(express.json());
connectDB();

app.use(cors({
     origin: "*",
     methods: ["POST", "GET", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"]
}));


async function getMyWorkshopId(adminId) {
     const workshop = await MWorkshop.findOne({ admin: adminId });
     if (!workshop) throw new Error("Você ainda não possui uma oficina cadastrada");
     return workshop._id;
}
app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/login", async (req, res) => {
     try {
          const { email, senha, type } = req.body;

          if (type === "admin") {
               const admin = await MAdmin.findOne({ email });
               if (!admin) return res.status(404).json({ error: "Admin não encontrado" });

               const validPassword = await bcrypt.compare(senha, admin.senha);
               if (!validPassword) return res.status(401).json({ error: "Senha inválida" });

               const token = jwt.sign({ id: admin._id, type: "admin" }, process.env.JWT_SECRET || "secret-key", { expiresIn: "8h" });
               const refreshToken = jwt.sign({ id: admin._id, type: "admin" }, process.env.JWT_SECRET || "secret-key", { expiresIn: "24h" });
               return res.json({ token, refreshToken, user: { id: admin._id, email: admin.email, type: "admin" } });
          }

          const user = await MUser.findOne({ email });
          if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

          const validPassword = await bcrypt.compare(senha, user.senha);
          if (!validPassword) return res.status(401).json({ error: "Senha inválida" });

          const token = jwt.sign({ id: user._id, type: "user" }, process.env.JWT_SECRET || "secret-key", { expiresIn: "8h" });
          const refreshToken = jwt.sign({ id: user._id, type: "user" }, process.env.JWT_SECRET || "secret-key", { expiresIn: "24h" });
          return res.json({ token, refreshToken, user: { id: user._id, email: user.email, type: "user" } });
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.post("/refresh", async (req, res) => {
     try {
          const { refreshToken } = req.body;
          if (!refreshToken) {
               return res.status(400).json({ error: "Refresh token obrigatório" });
          }

          const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "secret-key");
          const token = jwt.sign({ id: decoded.id, type: decoded.type }, process.env.JWT_SECRET || "secret-key", { expiresIn: "8h" });

          res.json({ token, user: { id: decoded.id, type: decoded.type } });
     } catch (error) {
          res.status(401).json({ error: "Refresh token inválido" });
     }
});

app.get("/me", authMiddleware, async (req, res) => {
     try {
          if (req.user.type === "admin") {
               const admin = await MAdmin.findById(req.user.id).select("-senha");
               return res.json(admin);
          }

          const user = await MUser.findById(req.user.id).select("-senha");
          return res.json(user);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

//! Workshop
app.post("/workshop", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const newWork = await createWorkshop({ ...req.body, admin: req.user.id });
          res.json(newWork);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});



app.get("/workshop/mine", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const myWork = await MWorkshop.findOne({ admin: req.user.id });
          res.json(myWork);
     } catch (error) {
          res.json({ error: error.message });
     }
});



app.put("/workshop/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshop = await MWorkshop.findById(req.params.id);
          if (!workshop) return res.status(404).json({ error: "Oficina não encontrada" });

          if (workshop.admin.toString() !== req.user.id) {
               return res.status(403).json({ error: "Você não tem permissão para editar esta oficina" });
          }
          const updateWork = await updateWorkshop(req.params.id, req.body, { new: true });
          res.json(updateWork);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.delete("/workshop/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshop = await MWorkshop.findById(req.params.id);
          if (!workshop) return res.status(404).json({ error: "Oficina não encontrada" });

          if (workshop.admin.toString() !== req.user.id) {
               return res.status(403).json({ error: "Você não tem permissão para excluir esta oficina" });
          }
          const deleteWork = await deleteWorkshop(req.params.id);
          res.json(deleteWork);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});



//! Veiculo
app.post("/veiculo", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshopId = await getMyWorkshopId(req.user.id);
          const newVeiculo = await createVeiculo({ ...req.body, workshop: workshopId });
          res.json(newVeiculo);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.put("/veiculo/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const veiculo = await MVeiculo.findById(req.params.id);
          if (!veiculo) return res.status(404).json({ error: "Veículo não encontrado" });

          const workshopId = await getMyWorkshopId(req.user.id);
          if (veiculo.workshop.toString() !== workshopId.toString()) {
               return res.status(403).json({ error: "Você não tem permissão para editar este veículo" });
          }
          const putVeiculo = await updateVeiculo(req.params.id, req.body, { new: true });
          res.json(putVeiculo);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.delete("/veiculo/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const veiculo = await MVeiculo.findById(req.params.id);
          if (!veiculo) return res.status(404).json({ error: "Veículo não encontrado" });

          const workshopId = await getMyWorkshopId(req.user.id);
          if (veiculo.workshop.toString() !== workshopId.toString()) {
               return res.status(403).json({ error: "Você não tem permissão para excluir este veículo" });
          }
          const delVeiculo = await deleteVeiculo(req.params.id);
          res.json(delVeiculo);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.get("/veiculo/mine", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshopId = await getMyWorkshopId(req.user.id);
          const meusVeiculos = await MVeiculo.find({ workshop: workshopId });
          res.json(meusVeiculos);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

//! Maintenance
app.post("/maintenance", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshopId = await getMyWorkshopId(req.user.id);
          const newMaintenance = await createMaintenance({ ...req.body, workshop: workshopId });
          res.json(newMaintenance);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.put("/maintenance/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {

          const maintenance = await MMaintenance.findById(req.params.id);
          if (!maintenance) return res.status(404).json({ error: "Manutenção não encontrada" });

          const workshopId = await getMyWorkshopId(req.user.id);
          if (maintenance.workshop.toString() !== workshopId.toString()) {
               return res.status(403).json({ error: "Você não tem permissão para editar esta manutenção" });
          }

          const putMaintenance = await updateMaintenance(req.params.id, req.body, { new: true });
          res.json(putMaintenance);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.delete("/maintenance/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const maintenance = await MMaintenance.findById(req.params.id);
          if (!maintenance) return res.status(404).json({ error: "Manutenção não encontrada" });

          const workshopId = await getMyWorkshopId(req.user.id);
          if (maintenance.workshop.toString() !== workshopId.toString()) {
               return res.status(403).json({ error: "Você não tem permissão para excluir esta manutenção" });
          }

          const delMaintenance = await deleteMaintenance(req.params.id);
          res.json(delMaintenance);
     } catch (error) {
          res.json({ error: error.message });
     }
});

app.get("/maintenance/mine", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const workshopId = await getMyWorkshopId(req.user.id);
          const minhasManutencoes = await MMaintenance.find({ workshop: workshopId });
          res.json(minhasManutencoes);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

//! User
app.post("/user", async (req, res) => {
     try {
          console.log("Body recebido:", req.body);
          const { senha, email, CPF, ...rest } = req.body;

          if (!senha || !email || !CPF) {
               return res.status(400).json({ error: "Nome, email, senha e CPF são obrigatórios" });
          }

          if (!isValidEmail(email)) {
               return res.status(400).json({ error: "E-mail inválido" });
          }

          if (!isValidCPF(CPF)) {
               return res.status(400).json({ error: "CPF inválido" });
          }

          const hashedPassword = await bcrypt.hash(senha, 10);
          const postUser = await createUser({ ...rest, email, CPF, senha: hashedPassword });
          res.json(postUser);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.put("/user/:id", authMiddleware, async (req, res) => {
     try {
          const updateData = req.body;
          if (updateData.senha) {
               updateData.senha = await bcrypt.hash(updateData.senha, 10);
          }
          const putUser = await updateUser(req.params.id, updateData, { new: true });
          res.json(putUser);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.delete("/user/:id", authMiddleware, async (req, res) => {
     try {
          const delUser = await deleteUser(req.params.id);
          res.json(delUser);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.get("/users", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const users = await MUser.find().select("-senha");
          res.json(users);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

//! Admin
app.post("/admin", async (req, res) => {
     try {
          const { senha, email, CNPJ, ...rest } = req.body;

          if (!senha || !email || !CNPJ) {
               return res.status(400).json({ error: "Nome da oficina, email, senha e CNPJ são obrigatórios" });
          }

          if (!isValidEmail(email)) {
               return res.status(400).json({ error: "E-mail inválido" });
          }

          if (!isValidCNPJ(CNPJ)) {
               return res.status(400).json({ error: "CNPJ inválido" });
          }

          const hashedPassword = await bcrypt.hash(senha, 10);
          const newAdmin = await createAdmin({ ...rest, email, CNPJ, senha: hashedPassword });
          res.json(newAdmin);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.put("/admin/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const updateData = req.body;
          if (updateData.senha) {
               updateData.senha = await bcrypt.hash(updateData.senha, 10);
          }
          const updatedAdmin = await updateAdmin(req.params.id, updateData, { new: true });
          res.json(updatedAdmin);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.get("/admins", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const admins = await MAdmin.find().select("-senha");
          res.json(admins);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.delete("/admin/:id", authMiddleware, requireRole("admin"), async (req, res) => {
     try {
          const delAdmin = await deleteAdmin(req.params.id);
          res.json(delAdmin);
     } catch (error) {
          res.status(400).json({ error: error.message });
     }
});

app.listen(DOOR, "0.0.0.0", () =>
     console.log(`The server is running in the door: ${DOOR}`)
);