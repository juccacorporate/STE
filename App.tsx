// ... (mantenha os imports do topo iguais)

  const handleSaveTask = async (taskData: Task) => {
    // ESTA PARTE É A "TRAVA DE SEGURANÇA"
    // Estamos mapeando cada campo na mão para não ter erro
    const payload = {
      id: taskData.id || Math.random().toString(36).substr(2, 9),
      region: taskData.region || '',
      title: taskData.title || '',
      description: taskData.description || '', // Descrição Detalhada
      category: taskData.category || '',
      priority: taskData.priority || '',
      owner: taskData.owner || '',
      support: taskData.support || '',
      startDate: taskData.startDate || '',
      dueDate: taskData.dueDate || '',
      status: taskData.status || '',
      progress: taskData.progress || 0,
      actionSteps: taskData.actionSteps || '', // Próximos Passos
      scenarioSummary: taskData.scenarioSummary || '', // Resumo
      timeline: taskData.timeline || '' // Timeline
    };

    console.log("Enviando para a planilha:", payload); // Isso ajuda a ver o erro no navegador

    try {
      if (editingTask) {
        // Atualiza na planilha
        await fetch(`${API_URL}/id/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: payload })
        });
        setTasks(prev => prev.map(t => t.id === editingTask.id ? payload : t));
      } else {
        // Cria novo na planilha
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [payload] })
        });
        setTasks(prev => [...prev, payload]);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }

    setIsModalOpen(false);
    setEditingTask(null);
  };

// ... (o resto do código do layout que te mandei antes continua igual)
