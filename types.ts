export interface ReportTopic {
  id: string;
  title: string;
  content: string;
}

export interface ReportData {
  unitName: string;
  areaName: string;
  introduction: string;
  topics: ReportTopic[];
  finalConsiderations: string;
  city: string;
  date: string;
  signerName: string;
  signerRole: string;
}

export const INITIAL_DATA: ReportData = {
  unitName: "UNIDADE DE TESTE",
  areaName: "Diretoria de Pesquisa e Desenvolvimento (DPD)",
  introduction: "",
  topics: [
    { id: '1', title: "Atividades Realizadas", content: "" }
  ],
  finalConsiderations: "",
  city: "Brasília",
  date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  signerName: "FULANO DE TAL",
  signerRole: "Pesquisador A"
};
