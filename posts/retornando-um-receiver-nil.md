Retornar uma interface em Go pode produzir um comportamento que contraria a intuição: uma função que aparentemente devolve `nil` entrega, na verdade, um valor não nulo.

## O cenário

Considere uma struct `Product` com um método `Validate` responsável por verificações básicas. Em vez de retornar apenas o primeiro erro encontrado, o método deve retornar todos os erros detectados. Para isso, será criado um tipo de erro customizado capaz de acumular mensagens.

```go
type ValidationErrors struct {
	messages []string
}

func (v *ValidationErrors) Add(msg string) {
	v.messages = append(v.messages, msg)
}

func (v *ValidationErrors) Error() string {
	return strings.Join(v.messages, "; ")
}
```

`ValidationErrors` satisfaz a interface `error` porque implementa o método `Error() string`. Além disso, expõe o método `Add`, que acrescenta uma mensagem à lista. Ambos usam *pointer receiver*.

Com esse tipo, o método `Product.Validate` pode verificar o preço e o nome. Se nenhuma verificação falhar, o retorno esperado é um erro `nil`.

```go
func (p Product) Validate() error {
	var errs *ValidationErrors

	if p.Price < 0 {
		errs = &ValidationErrors{}
		errs.Add("price is negative")
	}

	if p.Name == "" {
		if errs == nil {
			errs = &ValidationErrors{}
		}
		errs.Add("name is empty")
	}

	return errs
}
```

A variável `errs` é inicializada com o *zero value* de `ValidationErrors`, que é `nil`. Quando uma verificação falha, uma nova instância é alocada, caso ainda não exista, e a mensagem é adicionada. Ao final, `errs` é retornado e pode ser um ponteiro nulo ou um ponteiro para uma struct, dependendo do resultado das verificações.

## O comportamento inesperado

Ao testar a implementação com um produto válido, o resultado diverge do esperado.

```go
product := Product{Price: 10, Name: "Keyboard"}
if err := product.Validate(); err != nil {
	log.Fatalf("product is invalid: %v", err)
}
```

A saída será semelhante a:

```
2026/10/04 10:15:02 product is invalid: <nil>
```

O produto é válido, mas a condição `err != nil` foi avaliada como verdadeira, e a mensagem registrada exibe `<nil>`. Para entender a causa, é necessário observar como Go trata receivers e interfaces.

## Um pointer receiver pode ser nil

Em Go, um método com *pointer receiver* pode ser chamado a partir de um ponteiro nulo. O exemplo a seguir demonstra isso com um tipo sem utilidade prática.

```go
type Greeter struct{}

func (g *Greeter) Hello() string {
	return "hello"
}

func main() {
	var g *Greeter
	fmt.Println(g.Hello())
}
```

A variável `g` recebe o *zero value* de um ponteiro, ou seja, `nil`. Mesmo assim, o código compila e imprime `hello`. O motivo é que um método em Go equivale a uma função cujo primeiro parâmetro é o receiver. O método `Hello` é semelhante à função abaixo.

```go
func Hello(g *Greeter) string {
	return "hello"
}
```

Como passar um ponteiro nulo para uma função é válido, usar um ponteiro nulo como receiver também é.

## Por que a interface não é nil

Voltando ao método `Validate`, quando todas as verificações passam, o valor fornecido ao `return` não é `nil` diretamente, e sim um ponteiro nulo do tipo `ValidationErrors`. Como um ponteiro nulo é um receiver válido, a conversão desse valor para a interface `error` produz uma interface não nula.

Uma interface em Go funciona como um *dispatch wrapper*. O termo descreve dois papéis da interface: ela envolve (*wrap*) um valor concreto e, a partir dele, direciona (*dispatch*) as chamadas de método para a implementação correta. A interface não é o valor em si, e sim uma camada intermediária entre quem chama e o valor concreto.

Para cumprir esses papéis, um valor de interface guarda duas informações: o tipo concreto do valor encapsulado e o próprio valor. O tipo concreto permite determinar qual implementação de `Error()` deve ser executada, e o valor é o receiver passado a essa implementação. Uma interface é igual a `nil` apenas quando essas duas informações estão ausentes, ou seja, quando ela não encapsula nada.

Esse modelo explica o comportamento observado. Na declaração `var errs *ValidationErrors`, a variável tem tipo `*ValidationErrors` e valor `nil`. Ao executar `return errs` em uma função cujo retorno é `error`, o compilador cria um valor de interface que encapsula esse ponteiro. O resultado pode ser representado da seguinte forma:

```
error (interface)
├── tipo concreto: *ValidationErrors
└── valor:         nil
```

O conteúdo encapsulado (o ponteiro para `ValidationErrors`) é nulo, mas o invólucro (a interface `error`) não é, pois já possui um tipo concreto associado. Como a comparação `err != nil` verifica a interface como um todo, e não apenas o valor interno, ela resulta em `true`. Além disso, chamar `err.Error()` seria despachado para o método de `ValidationErrors` com um receiver nulo, o que é válido na chamada, mas pode causar um erro em tempo de execução caso o método acesse campos da struct.

Por isso, independentemente do `Product` recebido, quem chama `Validate` sempre obtém um erro diferente de `nil`. Já o `return nil` explícito da correção produz uma interface sem tipo concreto e sem valor, que é de fato igual a `nil`.

## Correção

A solução mais simples é retornar `errs` somente quando ele não for nulo e, caso contrário, retornar `nil` explicitamente.

```go
func (p Product) Validate() error {
	var errs *ValidationErrors

	if p.Price < 0 {
		// ...
	}

	if p.Name == "" {
		// ...
	}

	if errs != nil {
		return errs
	}
	return nil
}
```

Ao final do método, verifica-se se `errs` é diferente de `nil`. Em caso positivo, o ponteiro é retornado. Caso contrário, o literal `nil` é retornado, o que resulta em uma interface nula. Assim, para um produto válido, o chamador recebe uma interface `nil`, e não um ponteiro nulo convertido em uma interface não nula.

## Alcance do problema

O exemplo utilizou erros porque esse é o caso mais frequente, mas o problema não se restringe a eles. Ele pode ocorrer com qualquer interface implementada por meio de *pointer receivers*. Em geral, quando uma função precisa retornar uma interface, deve-se retornar o valor `nil` diretamente, e não um ponteiro nulo. Ter um ponteiro nulo nesse ponto normalmente não é um estado desejável e indica um provável bug.

## Conclusão

Em Go, um ponteiro nulo é um receiver válido, pois métodos são equivalentes a funções que recebem o receiver como primeiro parâmetro. Quando esse ponteiro nulo é convertido para uma interface, o resultado não é uma interface nula: o valor encapsulado é `nil`, mas o invólucro não é. Por isso, uma função que retorna uma interface deve retornar `nil` explicitamente quando não houver valor a devolver, em vez de retornar uma variável de ponteiro que possa estar nula. Esse cuidado vale para erros e para qualquer outra interface implementada com *pointer receivers*.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.