-- O email obrigatório já existe na baseline: acrescentamos apenas a unicidade.
CREATE UNIQUE INDEX `alunos_email_key` ON `alunos`(`email`);

CREATE TABLE `cursos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    UNIQUE INDEX `cursos_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- Preserva os cursos e alunos existentes antes de criar a chave estrangeira.
INSERT INTO `cursos` (`nome`) SELECT DISTINCT `curso` FROM `alunos`;

ALTER TABLE `alunos` ADD CONSTRAINT `alunos_curso_fkey`
FOREIGN KEY (`curso`) REFERENCES `cursos`(`nome`) ON DELETE RESTRICT ON UPDATE CASCADE;
