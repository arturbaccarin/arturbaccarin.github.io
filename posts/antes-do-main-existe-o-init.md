As funções `init` são funções especiais que são executadas antes de qualquer função no código. 

Elas são a terceira etapa na ordem de inicialização de um programa em Go, sendo:
1. Os pacotes importados são inicializados;
2. As variáveis e constantes globais do pacote são inicializadas;
3. As funções `init` são executadas.

Seu uso mais comum é preparar o estado do programa antes da execução principal na `main`, como por exemplo: verificar se variáveis de configuração estão corretamente definidas, checar a existência de arquivos necessários ou até mesmo criar recursos ausentes.

É possível declarar várias funções `init` em um mesmo pacote e em pacotes diferentes, desde que todas utilizem exatamente o nome `init`.

Quando isso ocorre, a ordem de execução delas é a seguinte dependendo do caso:

**Em pacotes com dependência entre si**

Se o pacote A depende do pacote B, a função `init` do pacote B será executada antes da função `init` do pacote A.

O Go garante que todos os pacotes importados sejam completamente inicializados antes que o pacote atual comece sua própria inicialização.

Essa dependência entre pacotes também pode ser forçada usando o identificador em branco, ou *blank identifier* (`_`), como no exemplo abaixo que o pacote `foo` será importado e inicializado, mesmo que não seja utilizado diretamente.

```go
package main

import (
    "fmt"
    _ "foo"
)

func main() {
    // ...
}
```

**Múltiplas funções `init` no mesmo arquivo**

Quando existem várias funções `init` no mesmo arquivo, elas são executadas na ordem em que aparecem no código.

**Múltiplas funções `init` em arquivos diferentes do mesmo pacote**

Nesse caso, a execução segue a ordem alfabética dos arquivos. Por exemplo, se um pacote contém dois arquivos, `a.go` e `b.go` e ambos possuem funções `init`, a função em `a.go` será executada antes da função em `b.go`.

No entanto, **não devemos depender da ordem de execução das funções `init` dentro de um mesmo pacote.** Isso pode ser arriscado, pois renomeações de arquivos podem alterar a ordem da execução, impactando o comportamento do programa.

Apesar de úteis, as funções `init` possuem algumas desvantagens e pontos de atenção que devem ser levados em conta na hora de escolher usá-las ou não:
1. **Elas podem dificultar o controle e tratamento de erros**, pois já que não retornam nenhum valor, nem de erro, uma das únicas formas de tratar problemas em sua execução é via `panic`, que causa a interrupção da aplicação.
2. **Podem complicar a implementação de testes**, por exemplo, se uma dependência externa for configurada dentro de `init`, ela será executada mesmo que não seja necessária para o escopo dos testes unitários. Além de serem executadas antes dos casos de teste, o que pode gerar efeitos colaterais inesperados.
3. **A alteração do valor de variáveis globais dentro da função `init `pode ser uma má prática em alguns contextos**:
   - **Dificulta testes:** como o estado global já foi definido automaticamente pela `init`, é difícil simular diferentes cenários ou redefinir esse estado nos testes.
   - **Aumenta o acoplamento:** outras partes do código passam a depender implicitamente do valor dessas variáveis globais, tornando o sistema menos modular.
   - **Reduz previsibilidade:** como a inicialização acontece automaticamente e sem controle do desenvolvedor, fica mais difícil entender ou modificar o fluxo de execução do programa.
   - **Afeta reutilização:** bibliotecas que dependem de `init` com variáveis globais são menos reutilizáveis, pois forçam comportamentos no momento da importação.

Em resumo, as funções `init` são úteis para configurações iniciais, mas seu uso deve ser criterioso, pois podem dificultar testes, tratamento de erros e tornar o código menos previsível.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.
