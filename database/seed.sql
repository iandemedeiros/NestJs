INSERT INTO alunos (nome, email, curso)
SELECT 'Ana', 'ana@example.com', 'Sistemas de Informação'
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'ana@example.com');

INSERT INTO alunos (nome, email, curso)
SELECT 'Carlos', 'carlos@example.com', 'Ciência da Computação'
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE email = 'carlos@example.com');
