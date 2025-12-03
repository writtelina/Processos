import React, { useState, useEffect } from 'react';
import { Download, FileText, Plus, Trash2, Wand2, Loader2, RefreshCcw } from 'lucide-react';
import { generateDocxBlob } from './services/docxGenerator';
import { improveTextWithAI, generateTopicContent } from './services/aiService';
import { ReportData, INITIAL_DATA, ReportTopic } from './types';

// Icons need to be imported from lucide-react, so make sure to install it.
// npm install lucide-react docx

const App: React.FC = () => {
  const [data, setData] = useState<ReportData>(INITIAL_DATA);
  const [isGenerating, setIsGenerating] = useState(false);
  const [improvingField, setImprovingField] = useState<string | null>(null);

  // Handle basic field changes
  const handleInputChange = (field: keyof ReportData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Topic Changes
  const handleTopicChange = (id: string, field: 'title' | 'content', value: string) => {
    setData((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    }));
  };

  const addTopic = () => {
    const newTopic: ReportTopic = {
      id: crypto.randomUUID(),
      title: `Novo Tópico`,
      content: '',
    };
    setData((prev) => ({ ...prev, topics: [...prev.topics, newTopic] }));
  };

  const removeTopic = (id: string) => {
    setData((prev) => ({ ...prev, topics: prev.topics.filter((t) => t.id !== id) }));
  };

  // AI Actions
  const handleAiImprove = async (field: keyof ReportData | string, currentText: string, context: string) => {
    if (!process.env.API_KEY) {
      alert("Configure a API KEY do Google Gemini para usar recursos de IA.");
      return;
    }
    if (!currentText.trim()) {
        if(field.toString().startsWith('topic-content-')) {
             // Generate from scratch if empty based on title
             const topicId = field.toString().replace('topic-content-', '');
             const topic = data.topics.find(t => t.id === topicId);
             if(topic) {
                setImprovingField(field as string);
                const generated = await generateTopicContent(topic.title);
                handleTopicChange(topicId, 'content', generated);
                setImprovingField(null);
                return;
             }
        }
        return;
    }

    setImprovingField(field as string);
    const improved = await improveTextWithAI(currentText, context);
    
    if (field === 'introduction' || field === 'finalConsiderations') {
      handleInputChange(field as keyof ReportData, improved);
    } else if (field.toString().startsWith('topic-content-')) {
      const topicId = field.toString().replace('topic-content-', '');
      handleTopicChange(topicId, 'content', improved);
    }
    
    setImprovingField(null);
  };

  // Download Handler
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateDocxBlob(data);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Embrapa_${data.unitName.replace(/\s+/g, '_')}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      alert('Erro ao gerar o arquivo. Verifique o console.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-800">
      
      {/* LEFT COLUMN: EDITOR */}
      <div className="w-full md:w-1/2 p-6 overflow-y-auto h-screen bg-white shadow-xl z-10">
        <header className="mb-8 border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-700 text-white p-2 rounded-lg">
                <FileText size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gerador de Relatório</h1>
          </div>
          <p className="text-slate-500 text-sm">Padrão Embrapa (Arial, 11pt)</p>
        </header>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Metadata Section */}
          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold mb-2">Cabeçalho</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Unidade</label>
                <input
                  type="text"
                  value={data.unitName}
                  onChange={(e) => handleInputChange('unitName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none uppercase"
                  placeholder="EX: EMBRAPA CERRADOS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Área / Sigla</label>
                <input
                  type="text"
                  value={data.areaName}
                  onChange={(e) => handleInputChange('areaName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="Ex: Chefia Adjunta de P&D"
                />
              </div>
            </div>
          </section>

          {/* Introduction */}
          <section className="space-y-2 group">
            <div className="flex justify-between items-center">
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold">Introdução</h2>
              <button
                type="button"
                onClick={() => handleAiImprove('introduction', data.introduction, "Introdução de um relatório técnico")}
                disabled={!!improvingField}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
              >
                {improvingField === 'introduction' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14} />}
                {data.introduction ? "Melhorar Texto" : "Gerar Rascunho"}
              </button>
            </div>
            <textarea
              value={data.introduction}
              onChange={(e) => handleInputChange('introduction', e.target.value)}
              rows={5}
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y text-sm leading-relaxed"
              placeholder="Descreva brevemente o objetivo do relatório..."
            />
          </section>

          {/* Topics */}
          <section className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
               <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold">Desenvolvimento</h2>
               <button
                  type="button"
                  onClick={addTopic}
                  className="flex items-center gap-1 text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full hover:bg-green-100 transition-colors"
                >
                  <Plus size={16} /> Adicionar Tópico
                </button>
            </div>
            
            <div className="space-y-6">
              {data.topics.map((topic, index) => (
                <div key={topic.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group transition-all hover:shadow-md">
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeTopic(topic.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Remover tópico"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                   
                   <div className="mb-3">
                     <label className="block text-xs font-bold text-slate-500 mb-1">Título do Tópico {index + 1}</label>
                     <input
                        type="text"
                        value={topic.title}
                        onChange={(e) => handleTopicChange(topic.id, 'title', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded focus:border-green-500 outline-none text-sm font-semibold"
                      />
                   </div>
                   
                   <div>
                    <div className="flex justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-500">Conteúdo</label>
                        <button
                            type="button"
                            onClick={() => handleAiImprove(`topic-content-${topic.id}`, topic.content, `Tópico do relatório sobre: ${topic.title}`)}
                            disabled={!!improvingField}
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                            {improvingField === `topic-content-${topic.id}` ? <Loader2 className="animate-spin" size={12}/> : <Wand2 size={12} />}
                            IA
                        </button>
                    </div>
                     <textarea
                        value={topic.content}
                        onChange={(e) => handleTopicChange(topic.id, 'content', e.target.value)}
                        rows={4}
                        className="w-full p-2 bg-white border border-slate-300 rounded focus:border-green-500 outline-none text-sm resize-y"
                        placeholder="Detalhes deste tópico..."
                      />
                   </div>
                </div>
              ))}
            </div>
          </section>

           {/* Final Considerations */}
           <section className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold">Conclusão</h2>
              <button
                type="button"
                onClick={() => handleAiImprove('finalConsiderations', data.finalConsiderations, "Considerações finais de um relatório técnico")}
                disabled={!!improvingField}
                className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {improvingField === 'finalConsiderations' ? <Loader2 className="animate-spin" size={14}/> : <Wand2 size={14} />}
                IA
              </button>
            </div>
            <textarea
              value={data.finalConsiderations}
              onChange={(e) => handleInputChange('finalConsiderations', e.target.value)}
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-y text-sm leading-relaxed"
              placeholder="Conclusões e encaminhamentos..."
            />
          </section>

          {/* Footer Info */}
          <section className="space-y-4 pt-4 border-t">
            <h2 className="text-sm uppercase tracking-wider text-slate-400 font-bold">Assinatura</h2>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-green-500"
                />
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-green-500"
                />
               </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável</label>
                <input
                  type="text"
                  value={data.signerName}
                  onChange={(e) => handleInputChange('signerName', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-green-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={data.signerRole}
                  onChange={(e) => handleInputChange('signerRole', e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md outline-none focus:border-green-500"
                />
              </div>
            </div>
          </section>
        </form>
        
        {/* Mobile Download Button (Visible only on small screens) */}
        <div className="md:hidden mt-8">
             <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full bg-blue-700 text-white py-4 rounded-lg font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Download />}
            Baixar Relatório .DOCX
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="hidden md:flex md:w-1/2 bg-slate-100 p-8 justify-center overflow-y-auto h-screen relative">
        <div className="sticky top-6 z-20 w-fit h-fit self-start ml-auto mr-4">
             <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 transform hover:-translate-y-1"
            >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Baixar .DOCX
            </button>
        </div>

        {/* Paper Simulation */}
        <div className="bg-white shadow-2xl w-[21cm] min-h-[29.7cm] p-[2.5cm] text-slate-900 box-border absolute top-8 mb-8 scale-90 origin-top">
            {/* Header */}
            <div className="mb-6 font-arial">
                <p className="text-[11pt] leading-tight">
                    <strong>Embrapa</strong><br />
                    <strong>{data.unitName.toUpperCase() || "NOME DA UNIDADE"}</strong><br />
                    {data.areaName || "Área da Unidade"}
                </p>
            </div>

            {/* Title */}
            <div className="mb-6 text-center">
                <p className="text-[11pt] font-bold">RELATÓRIO</p>
            </div>

            {/* Content Body */}
            <div className="font-arial text-[11pt] space-y-4 text-justify leading-normal">
                {/* Intro */}
                <div>
                    <p className="font-bold mb-1">Introdução</p>
                    <p className="whitespace-pre-wrap">{data.introduction || "Texto da introdução..."}</p>
                </div>

                {/* Topics */}
                {data.topics.map((topic) => (
                    <div key={topic.id}>
                        <p className="font-bold mb-1">{topic.title}</p>
                        <p className="whitespace-pre-wrap">{topic.content || "Conteúdo..."}</p>
                    </div>
                ))}

                {/* Conclusion */}
                <div>
                    <p className="font-bold mb-1">Considerações finais</p>
                    <p className="whitespace-pre-wrap">{data.finalConsiderations || "Considerações..."}</p>
                </div>

                {/* Spacer */}
                <div className="h-12"></div>

                {/* Signature */}
                <div>
                    <p className="mb-4">{data.city}, {data.date}.</p>
                    <p className="mb-0"><strong>{data.signerName.toUpperCase() || "NOME DO RESPONSÁVEL"}</strong></p>
                    <p>{data.signerRole || "Cargo"}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;
