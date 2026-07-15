Ao definir métodos em Go, uma das decisões mais comuns é escolher entre um *value receiver* e um *pointer receiver*. Embora ambos permitam associar métodos a um tipo, eles apresentam comportamentos distintos quanto à forma como recebem o objeto e como eventuais alterações afetam seu estado.

Essa decisão não deve ser baseada apenas em desempenho. Em muitos casos, fatores como mutabilidade, semântica da API e características do tipo envolvido possuem maior influência na escolha.

## Como funcionam os receivers em Go

Em Go, um método pode ser declarado utilizando um *value receiver* ou um *pointer receiver*.

Quando um método utiliza um *value receiver*, uma cópia do valor é passada para o método. Como consequência, qualquer alteração realizada dentro do método ocorre apenas sobre essa cópia. O objeto original permanece inalterado após a execução.

O exemplo a seguir demonstra esse comportamento.

```go
package main

import "fmt"

type Counter struct {
	value int
}

func (c Counter) Increment() {
	c.value++
}

func main() {
	counter := Counter{value: 10}

	counter.Increment()

	fmt.Println(counter.value) // output: 10
}
```

Nesse exemplo, o método `Increment` altera apenas a cópia da estrutura recebida. O campo `value` da variável `counter` continua armazenando o valor original.

Quando um método utiliza um *pointer receiver*, Go passa uma cópia do ponteiro para o método. Como esse ponteiro referencia o objeto original, o método pode acessar e modificar diretamente seus campos.

O exemplo abaixo utiliza a mesma estrutura, mas altera o tipo do *receiver*.

```go
package main

import "fmt"

type Counter struct {
	value int
}

func (c *Counter) Increment() {
	c.value++
}

func main() {
	counter := Counter{value: 10}

	counter.Increment()

	fmt.Println(counter.value) // output: 11
}
```

Agora a alteração ocorre diretamente sobre a estrutura original. 

É importante observar que Go não realiza passagem por referência. Mesmo utilizando um *pointer receiver*, o que é copiado durante a chamada do método é apenas o ponteiro para o objeto.

## Situações em que o receiver deve ser um ponteiro

Existem cenários em que utilizar um *pointer receiver* é necessário.

O primeiro ocorre quando o método precisa modificar o estado da estrutura. Como um *value receiver* trabalha sobre uma cópia, qualquer alteração seria descartada ao término da execução.

Esse mesmo princípio também se aplica a *slices* quando o método precisa utilizar `append`. Como essa operação pode alterar o próprio *slice*, o método deve utilizar um *pointer receiver* para que a alteração seja refletida na variável original.

O exemplo abaixo demonstra esse caso.

```go
package main

import "fmt"

type Queue []string

func (q *Queue) Enqueue(item string) {
	*q = append(*q, item)
}

func main() {
	queue := Queue{"A", "B"}

	queue.Enqueue("C")

	fmt.Println(queue) // output: [A B C]
}
```

Nesse exemplo, o método modifica o próprio *slice*, atualizando seu tamanho e, possivelmente, sua capacidade. Por isso, o *receiver* precisa ser um ponteiro.

Outro caso obrigatório ocorre quando a estrutura possui campos que não podem ser copiados, como determinados tipos definidos no pacote `sync`. Como esses tipos mantêm estado interno, copiá-los pode produzir comportamentos incorretos.

## Situações em que o receiver deve ser um valor

Também existem cenários em que um *value receiver* é a escolha mais adequada.

Quando o objetivo é garantir que o método não altere o estado da estrutura, utilizar um *value receiver* reforça essa característica. O método sempre trabalhará sobre uma cópia do objeto recebido.

Além disso, quando o receiver é um mapa, uma função ou um canal, os métodos devem utilizar um *value receiver*. Esses tipos não permitem que métodos sejam declarados utilizando um *pointer receiver*. Caso isso seja feito, o compilador emitirá um erro.

O exemplo a seguir demonstra um método definido sobre um tipo cujo tipo subjacente é um mapa.

```go
package main

import "fmt"

type Dictionary map[string]string

func (d Dictionary) Get(key string) string {
	return d[key]
}

func main() {
	d := Dictionary{
		"go": "Golang",
	}

	fmt.Println(d.Get("go")) // output: Golang
}
```

Nesse exemplo, `Dictionary` é um tipo definido a partir de um mapa. O método `Get` utiliza um *value receiver*, permitindo acessar os dados normalmente.

Caso o mesmo método fosse declarado utilizando um *pointer receiver*, o código não seria compilado.

```go
package main

type Dictionary map[string]string

func (d *Dictionary) Add(key, value string) {
	(*d)[key] = value
}

func main() {}
```

Nesse caso, o compilador gera um erro porque mapas não permitem métodos declarados com *pointer receivers*. O mesmo comportamento também se aplica a funções e canais.

## Quando um pointer receiver é recomendado

Mesmo quando não existe necessidade de alterar a estrutura, um *pointer receiver* pode ser preferível caso o objeto seja grande.

Como um *value receiver* copia toda a estrutura durante a chamada do método, objetos maiores podem tornar essa operação mais custosa. Entretanto, não existe um tamanho específico que determine quando essa troca é vantajosa. Essa decisão depende das características da aplicação e, quando houver dúvidas, pode ser avaliada por meio de *benchmarks*.

## Quando um value receiver é recomendado

Em outras situações, um *value receiver* representa uma escolha mais apropriada por comunicar que o método não altera o estado do objeto.

Essa abordagem costuma ser recomendada nos seguintes casos:

- O receiver é um *slice* que não será modificado.
- O receiver é um array pequeno ou uma estrutura pequena que representa naturalmente um valor.
- O receiver representa um tipo imutável, como `time.Time`.
- O receiver é um tipo básico, como `int`, `float64` ou `string`.

Nesses cenários, trabalhar sobre uma cópia normalmente possui baixo custo e torna mais explícita a intenção do método.

## Mutabilidade indireta

Nem sempre um *value receiver* impede alterações no estado observado pela aplicação.

Considere uma estrutura que contém um ponteiro para outra estrutura.

```go
package main

import "fmt"

type Settings struct {
	enabled bool
}

type Service struct {
	config *Settings
}

func (s Service) Enable() {
	s.config.enabled = true
}

func main() {
	service := Service{
		config: &Settings{},
	}

	service.Enable()

	fmt.Println(service.config.enabled) // output: true
}
```

Embora o método `Enable` utilize um *value receiver*, o valor exibido será `true`.

Isso acontece porque apenas a estrutura `Service` foi copiada. O ponteiro armazenado em `config` continua apontando para o mesmo objeto em memória. Assim, a alteração ocorre sobre a estrutura referenciada pelo ponteiro.

Mesmo que esse comportamento seja válido, utilizar um *pointer receiver* pode tornar mais evidente que o objeto possui comportamento mutável, deixando a intenção do método mais clara para quem utiliza a API.

## Misturando value receivers e pointer receivers

Uma mesma estrutura pode possuir métodos definidos tanto com *value receivers* quanto com *pointer receivers*. Entretanto, essa prática costuma ser evitada para manter consistência na API.

Existe uma exceção relevante na biblioteca padrão. O tipo `time.Time` utiliza predominantemente *value receivers* para preservar sua característica de imutabilidade. Contudo, alguns métodos precisam modificar seu estado para implementar interfaces já existentes da biblioteca padrão. Nesses casos específicos, são utilizados *pointer receivers*.

Outro motivo para evitar essa mistura está relacionado à implementação de interfaces. Em Go, o conjunto de métodos (*method set*) de um tipo é diferente do conjunto de métodos de seu ponteiro. Métodos definidos com *pointer receivers* pertencem apenas ao tipo ponteiro, enquanto métodos com *value receivers* pertencem tanto ao valor quanto ao ponteiro. Como consequência, misturar os dois tipos de *receiver* pode fazer com que apenas o tipo ponteiro implemente determinada *interface*, enquanto o tipo valor não a implementa. Esse comportamento pode gerar erros de compilação quando um valor é utilizado onde uma interface é esperada.

Esse comportamento demonstra que misturar os dois tipos de *receiver* não é proibido, mas normalmente deve ocorrer apenas quando existir uma justificativa técnica clara.

## Qual receiver utilizar?

De forma geral, a escolha pode ser resumida da seguinte maneira:

- Utilize *pointer receivers* quando o método precisar modificar o objeto.
- Utilize *pointer receivers* quando a estrutura possuir campos que não podem ser copiados.
- Considere *pointer receivers* para estruturas grandes, quando a cópia puder representar um custo relevante.
- Utilize *value receivers* quando a intenção for preservar a imutabilidade do objeto.
- Prefira manter consistência dentro da mesma estrutura, evitando misturar os dois tipos de *receiver*, salvo quando houver uma justificativa técnica.
- Utilize *pointer receivers* quando o método precisar utilizar `append` sobre um *slice*.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.