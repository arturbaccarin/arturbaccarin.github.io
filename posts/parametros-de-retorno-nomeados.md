Os valores de retorno de uma função ou método podem receber nomes. Esse recurso é conhecido como *named result parameters*. 

Seu uso levanta uma questão de design: em quais situações nomear os retornos torna o código mais claro e em quais ele não traz benefícios.

## Como funciona

Quando um resultado é nomeado, ele passa a existir como uma variável comum dentro da função ou método. Essa variável é inicializada com o seu *zero value* no início da execução. Os nomes também permitem o uso de um *naked return*, ou seja, uma instrução `return` sem argumentos. Nesse caso, os valores atuais das variáveis de retorno são os valores retornados.

```go
func addTax(price int) (total int) {
	total = price + price/10
	return
}
```

A função declara `total` como resultado nomeado. A variável começa em zero, recebe o valor calculado e, ao executar `return` sem argumentos, a função devolve o valor atual de `total`.

## Nomes como documentação da assinatura

### Definição de interface

Considere uma interface não exportada que define um método para extrair um intervalo numérico a partir de um texto.

```go
type rangeParser interface {
	parse(input string) (int, int, error)
}
```

A assinatura não informa qual dos dois `int` representa o valor mínimo e qual representa o máximo. Pode-se supor que o mínimo venha primeiro, mas a convenção varia. O leitor precisaria consultar a implementação para entender o significado dos resultados.

Nomear os retornos elimina a ambiguidade na própria assinatura.

```go
type rangeParser interface {
	parse(input string) (min, max int, err error)
}
```

Com essa versão, a ordem dos valores fica explícita: mínimo primeiro, máximo depois. Em definições de interface, o uso de retornos nomeados tende a melhorar a legibilidade sem efeitos colaterais.

### Implementação do método

A mesma questão se aplica à implementação. Manter os nomes na assinatura do método concreto permite ao leitor entender os resultados sem percorrer o corpo da função.

```go
func (p csvParser) parse(input string) (
	min, max int, err error) {
	// ...
}
```

Nesse caso, a assinatura expressiva justifica o uso de retornos nomeados também na implementação.

## Quando os nomes não agregam valor

Nem toda assinatura se beneficia de retornos nomeados. Considere a função a seguir, que persiste um pedido.

```go
func SaveOrder(order Order) (err error) {
	// ...
}
```

A função retorna um único valor, e o nome `err` apenas repete o que o tipo `error` já comunica. Nessa situação, o nome não auxilia o leitor, e é preferível omitir os retornos nomeados.

```go
func SaveOrder(order Order) error {
	// ...
}
```

A decisão depende do contexto. Quando não está claro se os nomes melhoram a legibilidade, a recomendação é não utilizá-los.

## Inicialização automática como conveniência

Como os retornos nomeados já chegam inicializados com o *zero value*, eles podem ser úteis mesmo quando não melhoram a legibilidade. O exemplo a seguir lê de um `io.Reader` até preencher o buffer ou até ocorrer um erro, acumulando o total de bytes lidos.

```go
func fillBuffer(r io.Reader, buf []byte) (n int, err error) {
	for len(buf) > 0 && err == nil {
		var read int
		read, err = r.Read(buf)
		n += read
		buf = buf[read:]
	}
	return
}
```

A função declara `n` e `err` como retornos nomeados. Como ambos começam com o *zero value*, `n` pode ser acumulado com `+=` e `err` pode ser usado na condição do laço sem declaração prévia. A variável `read` guarda a quantidade lida em cada iteração, e o slice `buf` avança a cada passo. Ao final, o `return` sem argumentos devolve os valores acumulados.

Nesse exemplo, os nomes não aumentam de forma significativa a legibilidade. O ganho está em uma implementação mais curta. Em contrapartida, a função pode causar alguma confusão em uma primeira leitura, o que reforça que a escolha consiste em encontrar um equilíbrio.

## Naked returns

O *naked return* é considerado aceitável em funções curtas. Em funções mais longas, ele pode prejudicar a legibilidade, pois o leitor precisa lembrar os valores das variáveis de retorno ao longo de todo o corpo da função. Também é recomendável manter consistência dentro do escopo de uma função, utilizando apenas *naked returns* ou apenas retornos com argumentos.

## Efeitos colaterais não intencionais

Como os retornos nomeados são inicializados com o *zero value*, seu uso pode causar bugs sutis quando não há cuidado. Considere um método que retorna a largura e a altura de uma imagem a partir de um caminho. Por retornar dois `int`, o método usa retornos nomeados para tornar explícito o significado de cada valor. Ele primeiro valida a existência do arquivo e, em seguida, verifica o `context.Context` recebido para garantir que não foi cancelado e que o prazo não expirou.

Um `context.Context` pode carregar um sinal de cancelamento ou um *deadline*. Essas condições são verificadas chamando o método `Err` e testando se o erro retornado é diferente de `nil`.

```go
func (r reader) dimensions(ctx context.Context, path string) (width, height int, err error) {
	exists := r.fileExists(path)
	if !exists {
		return 0, 0, errors.New("file not found")
	}

	if ctx.Err() != nil {
		return 0, 0, err
	}

	// Lê e retorna as dimensões
}
```

No bloco `if ctx.Err() != nil`, o valor retornado é `err`, mas nenhum valor foi atribuído a essa variável. Ela continua com o *zero value* do tipo `error`, que é `nil`. Portanto, mesmo com o contexto cancelado, o método retorna um erro `nil`.

Além disso, o código compila justamente porque `err` foi inicializada pelo uso de retornos nomeados. Sem o nome, o compilador reportaria um erro indicando que a referência a `err` não foi resolvida.

### Atribuindo o erro do contexto

Uma correção possível é atribuir o resultado de `ctx.Err()` a uma variável `err` antes de retorná-la.

```go
if err := ctx.Err(); err != nil {
	return 0, 0, err
}
```

O código continua retornando `err`, mas agora ela recebe o resultado de `ctx.Err()` na própria instrução `if`. Nesse exemplo, a variável `err` declarada no `if` faz sombreamento da variável de retorno de mesmo nome, ou seja, é uma variável distinta que existe apenas no escopo do bloco.

### Utilizando um naked return

Outra opção é usar um *naked return*.

```go
if err = ctx.Err(); err != nil {
	return
}
```

Nesse caso, o operador `=` atribui o resultado à variável de retorno `err`, e o `return` sem argumentos devolve os valores atuais dos resultados. No entanto, essa alternativa viola a regra de não misturar *naked returns* com retornos com argumentos na mesma função, já que os demais `return` do método informam valores explicitamente. Por isso, a primeira opção é a mais adequada. Usar retornos nomeados não implica necessariamente usar *naked returns*, e em alguns casos os nomes servem apenas para tornar a assinatura mais clara.

## Conclusão

Parâmetros de retorno nomeados em Go são variáveis inicializadas com o *zero value* que permitem o uso de *naked returns*. Seu principal benefício está em documentar a assinatura, especialmente em interfaces e em funções que retornam múltiplos valores do mesmo tipo. Em outros casos, como funções que retornam apenas um `error`, o nome não acrescenta informação.

Também existe o uso por conveniência, em que a inicialização automática reduz o código, mas pode dificultar a leitura inicial. Os *naked returns* devem ficar restritos a funções curtas e ser usados de forma consistente dentro da função. De modo geral, os retornos nomeados devem ser usados com moderação e apenas quando houver um benefício claro.

Por fim, como cada retorno nomeado é inicializado com o *zero value*, o uso descuidado pode gerar bugs sutis e nem sempre fáceis de identificar durante a leitura do código. Um exemplo é retornar uma variável `err` à qual nenhum valor foi atribuído, o que resulta em um erro `nil` mesmo diante de uma falha. Nessas situações, atribuir o erro em uma instrução `if` mantém o código consistente, e convém ter cautela ao usar retornos nomeados para evitar efeitos colaterais.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.