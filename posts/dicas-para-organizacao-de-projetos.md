A estruturação de projetos Go pode representar um desafio, especialmente devido à ausência de padrões rígidos ou convenções oficiais. Essa flexibilidade proporciona autonomia ao desenvolvedor, mas também exige atenção e cuidado para garantir clareza e manutenção eficiente do código.

Este artigo apresenta diretrizes amplamente reconhecidas pela comunidade Go, com o objetivo de auxiliar na organização de projetos.

### Project-layout

Um dos modelos mais adotados é o proposto pelo repositório https://github.com/golang-standards/project-layout, que sugere uma estrutura de diretórios em alto nível, baseada em práticas consolidadas de projetos reais.

Alguns dos diretórios recomendados são:

- **/cmd** – Contém os arquivos principais da aplicação, como `main.go`. Cada subdiretório deve corresponder ao nome do executável. A função `main` deve ser concisa, delegando responsabilidades para pacotes internos.
- **/internal** – Abriga o código privado da aplicação, não acessível por outros projetos. A partir do Go 1.4, o compilador restringe a importação de pacotes fora da árvore de diretórios.
- **/pkg** – Reúne código que pode ser reutilizado por aplicações externas e por isso o código presente deve ser bem consistente para evitar erros em quem utiliza.
- **/api** – Armazena documentação e definições de APIs, como arquivos Swagger, esquemas JSON e protocolos.
- **/web** – Contém recursos para aplicações *web*, como arquivos estáticos e templates.
- **/configs** – Inclui arquivos de configuração, como parâmetros de servidor, banco de dados e chaves de API.
- **/build** – Define instruções de compilação e implantação, incluindo Dockerfiles e configurações de integração contínua.
- **/tools** – Reúne ferramentas auxiliares utilizadas no projeto.
- **/test** – Contém dados e funções de apoio para testes de integração. Os testes unitários devem permanecer no mesmo pacote das funções testadas.

⚠️ Recomenda-se evitar o uso do diretório **/src**, por tratar-se de uma convenção oriunda da linguagem Java, não alinhada às práticas do Go.

**Organização de pacotes**

A linguagem Go não adota o conceito de subpacotes. Dessa forma, a organização dos pacotes deve ser orientada à clareza e à funcionalidade, facilitando a compreensão por outros desenvolvedores. Por exemplo:

```text
shopapp/
│
├── go.mod
├── main.go
│
├── internal/
│   ├── user/
│   │   ├── model.go
│   │   └── service.go
│   │
│   ├── order/
│   │   ├── model.go
│   │   ├── service.go
│   │   └── validation/
│   │       └── validation.go
```

**Recomendações**

- Evite a criação excessiva de pacotes nas fases iniciais do projeto. Uma estrutura simples e contextual tende a ser mais eficaz.
- Reduza ao máximo a exposição de tipos e funções exportáveis. Essa prática minimiza o acoplamento entre pacotes e facilita futuras refatorações.
- Em caso de dúvida sobre a necessidade de exportação de um elemento, opte por mantê-lo privado.
- Nomeie os pacotes com base no que eles oferecem, e não apenas no conteúdo que armazenam. Isso contribui para uma nomenclatura mais intuitiva, sempre lembrando que o nome do pacote é utilizado no uso de um elemento exportado, como:

```go
import (
  "net/http"
  "github.com/gin-gonic/gin"
)

func main() {
  r := gin.Default()
  // ...
}
```

**Para saber mais**:

[https://go.dev/doc/modules/layout](https://go.dev/doc/modules/layout)

[https://medium.com/golang-learn/go-project-layout-e5213cdcfaa2](https://medium.com/golang-learn/go-project-layout-e5213cdcfaa2)

[https://blog.sgmansfield.com/2016/01/an-analysis-of-the-top-1000-go-repositories](https://blog.sgmansfield.com/2016/01/an-analysis-of-the-top-1000-go-repositories)

[https://travisjeffery.com/b/2019/11/i-ll-take-pkg-over-internal](https://travisjeffery.com/b/2019/11/i-ll-take-pkg-over-internal)

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.