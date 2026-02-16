Uma das perguntas mais frequentes sobre Go é se existe algum guia de estilo para a escrita de código, como a nomenclatura de variáveis, funções e pacotes, semelhante ao PEP 8 do Python.

Essa dúvida, inclusive, está presente na página de *[Frequently Asked Questions (FAQ)](https://go.dev/doc/faq)* da documentação oficial da linguagem, na seguinte pergunta: 

*Is there a Go programming style guide?*

E a resposta é:

*There is no explicit style guide, although there is certainly a recognizable “Go style”.* (Não existe um guia de estilo explícito, embora haja certamente um “estilo Go” reconhecível.)

O que existe são convenções para orientar sobre nomenclatura, *layout* e organização de arquivos.

O `gofmt`, ferramenta oficial da linguagem de programação Go, formata automaticamente o código-fonte de acordo com o estilo padrão da linguagem. Embora não seja obrigatório, esse estilo é amplamente adotado pela comunidade como o jeito certo de escrever código Go. O `gofmt` pode ser integrado a IDEs como o *Visual Studio Code*, permitindo que a formatação seja aplicada automaticamente sempre que o arquivo for salvo.

Existem também documentos que contêm conselhos sobre esses tópicos, como:

- Effective Go – [https://go.dev/doc/effective_go](https://go.dev/doc/effective_go)
- Go Code Review Comments – [https://go.dev/wiki/CodeReviewComments](https://go.dev/wiki/CodeReviewComments)

O guia mais completo que encontrei até hoje é o *[Go Style Decisions](https://google.github.io/styleguide/go/decisions)*, publicado pelo *Google* (vale lembrar que a linguagem Go surgiu dentro da própria empresa). Esse guia é, inclusive, referenciado na documentação oficial do Go, na página *[Go Code Review Comments](https://go.dev/wiki/CodeReviewComments)*.

Considero esse documento minha principal referência quando o assunto é estilo, e abaixo destaco os pontos mais relevantes sobre nomenclatura, segundo a minha visão pessoal:

## Underscores _

No código Go, utiliza-se **CamelCase** em vez de *underscores*, como no *snake_case*, para nomes compostos por várias palavras dos identificadores.

```go
// Prefira
var userBalance int
var firstName string

// Evite
var user_balance int
var first_name string
```

**Nota**: Os nomes dos arquivos de código-fonte não são identificadores Go e, portanto, não precisam seguir as mesmas convenções de nomenclatura. Eles podem conter *underscores*, como, por exemplo, *my_api_handlers.go* (isso é até o recomendado para esses casos).

## Pacotes

Os nomes dos pacotes devem ser curtos e conter somente letras minúsculas.

Se forem compostos por múltiplas palavras, elas devem ser escritas juntas, sem separação ou caracteres especiais.

```go
// Prefira
package imagefilter

// Evite
package ImageFilter
package image_filter
```

Se for necessário importar um pacote cujo nome contenha *underscore* (geralmente código de terceiros), ele deve ser renomeado durante a importação para um nome mais adequado seguindo as boas práticas.

```go
import myutils "github.com/example/my_utils"
```

Seja consistente usando sempre o mesmo nome para o mesmo pacote importado em diferentes arquivos.

Evite usar nomes que também possam ser utilizados por variáveis, a fim de prevenir [sombreamento](voce-conhece-o-sombreamento-em-go.html) no código.

```go
package main

import "myproject/data"

func main() {
	data := getData() // "data" se transforma em uma variável, sombreando o pacote
}
```

**Exceção a regra:**

Quando for necessário testar um pacote como um usuário externo, ou seja, testando apenas sua interface pública, é preciso adicionar o sufixo `**_test*` ao nome do pacote nos arquivos de teste.

Isso força a importação explícita do pacote, permitindo a realização do chamado teste de caixa-preta (*black box testing*).

Para saber mais, acesse: [https://pkg.go.dev/testing](https://pkg.go.dev/testing).

```go
package calc_test

import (
    "testing"
    "myproject/calc"
)
```

## Receptores (*receivers*)

Eles devem ser curtos, sendo uma ou duas letras do próprio nome, e usados de forma igual para todos os métodos daquele tipo.

| **Prefira** | **Evite** |
|-------------|-----------|
| func (t Tray) | func (tray Tray) |
| func (ri *ResearchInfo) | func (info *ResearchInfo) |
| func (w *ReportWriter) | func (this *ReportWriter) |
| func (s *Scanner) | func (self *Scanner) |

## Constantes

Deve ser utilizado CamelCase, assim como os outros nomes.

Constantes exportadas começam com letra maiúscula, enquanto constantes não exportadas começam com letra minúscula.

Isso se aplica mesmo que contrarie convenções de outras linguagens, como em Java, onde as constantes são geralmente todas maiúsculas e com *underscore*. Por exemplo, `MAX_RETRIES` se tornaria `MaxRetries` em Go.

Além disso, não é necessário começar o nome com a letra “k”.

```go
// Prefira
const MaxPacketSize = 512 // exportada
const maxBufferSize = 1024 // não exportada

// Evite
const MAX_PACKET_SIZE = 512
const kMaxBufferSize = 1024
```

## Siglas

Palavras em nomes que são siglas ou acrônimos (ex: URL e OTAN) devem manter a capitalização (todo maiúsculo ou tudo minúsculo).

Em nomes com múltiplas siglas (ex: XMLAPI, pois contém XML e API), cada letra de uma mesma sigla deve ter a mesma capitalização, mas as siglas diferentes podem usar capitalizações distintas.

Se a sigla contiver letras minúsculas (ex: DDoS, iOS, gRPC), ela deve manter a forma original, a menos que precise mudar a primeira letra para exportação (como em linguagens de programação).

| Nome | Escopo | Prefira | Evite |
|------|--------|----------|--------|
| XML API | Exportada | XMLAPI | XmlApi, XMLApi, XmlAPI, XMLapi |
| XML API | Não exportada | xmlAPI | xmlapi, xmlApi |
| iOS | Exportada | IOS | Ios, IoS |
| iOS | Não exportada | iOS | ios |
| gRPC | Exportada | GRPC | Grpc |
| gRPC | Não exportada | gRPC | grpc |
| DDoS | Exportada | DDoS | DDOS, Ddos |
| DDoS | Não exportada | ddos | dDos, dDOS |
| ID | Exportada | ID | ID |
| ID | Não exportada | id | iD |
| DB | Exportada | DB | Db |
| DB | Não exportada | db | dB |

## Getters

Nomes de funções e métodos não devem utilizar o prefixo “Get” ou “get”, a menos que o conceito envolva a palavra “get” de forma natural (como em uma requisição HTTP GET). 

Prefira começar o nome diretamente com o substantivo. Por exemplo, use `Counts` em vez de `GetCounts`.

Se a função envolve um cálculo complexo ou a execução de uma chamada remota, é recomendável usar palavras como `Compute` (calcular) ou `Fetch` (buscar), em vez de `Get`, para deixar claro ao desenvolvedor que a execução da função pode demorar, bloquear ou falhar.

```go
// Prefira
func UserName()
func Counts()
func ComputeStatistics()
func CalculateScore()

// Evite
func GetUserName()
func GetCounts()
func GetStatistics()
func GetScore()
```

## Repetição

Um código deve evitar repetições desnecessárias, que podem ocorrer de diferentes formas, especialmente na nomeação de pacotes, variáveis, constantes ou funções exportadas. 

**Nas funções, não repita o nome do pacote:**

```go
// Prefira
package yamlconfig

func Parse(input string) (*Config, error)

// Evite
package yamlconfig

func ParseYAMLConfig(input string) (*Config, error)
```

Mais exemplos:

| **Prefira** | **Evite** |
|-------------|-----------|
| widget.New | widget.NewWidget |
| widget.NewWithName | widget.NewWidgetWithName |
| db.Load | db.LoadFromDatabase |
| gtutil.CountGoatsTeleported<br>goatteleport.Count | goatteleportutil.CountGoatsTeleported |
| mtpb.MyTeamMethodRequest<br>myteampb.MethodRequest | myteampb.MyTeamMethodRequest |

**Nos métodos, não repita o nome do receptor:**

```go
// Prefira
func (c *Config) WriteTo(w io.Writer) (int64, error)

// Evite
func (c *Config) WriteConfigTo(w io.Writer) (int64, error)
```

**Não repita o nome das variáveis passadas por parâmetros:**

```go
// Prefira
func Override(dest, source *Config) error

// Evite
func OverrideFirstWithSecond(dest, source *Config) error
```

**Não repita os nomes e tipos dos valores de retorno:**

```go
// Prefira
func Transform(input *Config) *jsonconfig.Config

// Evite
func TransformToJSON(input *Config) *jsonconfig.Config
```

Quando for necessário remover a ambiguidade de funções de nomes similares, é aceitável incluir informações adicionais.

```go
func (c *Config) WriteTextTo(w io.Writer) (int64, error)
func (c *Config) WriteBinaryTo(w io.Writer) (int64, error)
```

## Nome da variáveis VS tipo

O compilador sempre conhece o tipo de uma variável, e na maioria dos casos, o tipo também é claro para o desenvolvedor com base em como a variável é utilizada.

Só é necessário especificar o tipo de uma variável quando seu valor aparecer duas vezes no mesmo escopo.

```go
// Prefira
var users int
var name string
var primary *Project

// Evite
var numUsers int
var nameString string
var primaryProject *Project
```

Se o valor aparece em múltiplas formas, isso pode ser esclarecido com o uso de uma palavra adicional, como `raw` (bruto) e `parsed` (processado).

```go
// Prefira
limitRaw := r.FormValue("limit")
limit, err := strconv.Atoi(limitRaw)

// Evite
limitStr := r.FormValue("limit")
limit, err := strconv.Atoi(limitStr)
```

## Contexto externo VS nomes locais

Nomes que incluem informações já presentes no contexto ao redor geralmente adicionam ruído desnecessário, sem agregar benefícios. 

O nome do pacote, do método, do tipo, da função, do caminho de importação e até mesmo o nome do arquivo já fornecem contexto suficiente para qualificar automaticamente todos os nomes dentro deles.

```go
// Prefira:
import "ads/targeting/revenue/reporting"

type Report struct{}

func (p *Project) Name() string

// Evite:
import "ads/targeting/revenue/reporting"

type AdsTargetingRevenueReport struct{}

func (p *Project) ProjectName() string

// ----------------------------------
// Prefira:
import "sqldb"

type Connection struct{}

// Evite:
import "sqldb"

type DBConnection struct{}

// ----------------------------------
// Prefira:
import "ads/targeting"

func Process(in *pb.FooProto) *Report {
    id := in.GetAdsTargetingID()
}

// Evite:
import "ads/targeting"

func Process(in *pb.FooProto) *Report {
    adsTargetingID := in.GetAdsTargetingID()
}
```

## Leitura complementar

Qual seria um tamanho bom de um nome de variável, constantes e função?

A regra é que o tamanho do nome deve ser proporcional ao escopo dele e inversamente proporcional ao número de vezes que ele é usado dentro desse escopo.

Uma variável com escopo de arquivo pode precisar de várias palavras, enquanto uma variável dentro de um bloco interno (como um `IF` ou um `FOR`) pode ser um nome curto ou até uma única letra, para manter o código claro e evitar informações desnecessárias.

Aqui está uma orientação (não é regra) do que seria o tamanho de cada escopo em linhas.

- **Escopo pequeno**: uma ou duas pequenas operações, entre 1 e 7 linhas.
- **Escopo médio**: algumas pequenas operações ou uma grande operação, entre 8 e 15 linhas.
- **Escopo grande**: uma ou algumas operações grandes, entre 15 e 25 linhas.
- **Escopo muito grande**: várias operações que podem envolver diferentes responsabilidades, mais de 25 linhas.

Um nome que é claro em um escopo pequeno (por exemplo, **c** para um contador) pode não ser suficiente em um escopo maior, exigindo mais clareza para lembrar ao desenvolvedor de seu propósito.

A especificidade do conceito também pode ajudar a manter o nome de uma variável conciso. Por exemplo, se houver apenas um banco de dados em uso, um nome curto como `db`, que normalmente seria reservado para escopos pequenos, pode continuar claro mesmo em um escopo maior.

Nomes de uma única palavra, como `count` e `options`, são um bom ponto de partida. Caso haja ambiguidade, palavras adicionais podem ser incluídas para torná-los mais claros, como `userCount` e `projectCount`.

**E como dica final**: evite remover letras para reduzir o tamanho do nome, como em `Sbx` em vez de `Sandbox`, pois isso pode prejudicar a clareza. No entanto, há exceções, como nomes amplamente aceitos pela comunidade de forma reduzida, como `db` para `database` e `ctx` para `context`.
