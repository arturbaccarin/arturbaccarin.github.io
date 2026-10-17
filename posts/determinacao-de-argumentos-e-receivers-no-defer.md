A instrução `defer` adia a execução de uma chamada até que a função que a contém retorne. Um erro comum é não compreender em que momento os argumentos e o receiver dessa chamada são determinados.

## Determinação de argumentos

### O cenário

Considere uma função `syncCatalog` que precisa chamar duas outras funções, `fetchRemote` e `saveLocal`, e manter um resultado sobre a execução:

- `ResultOK`, se ambas retornarem sem erro;
- `ResultFetchFailed`, se `fetchRemote` retornar erro;
- `ResultSaveFailed`, se `saveLocal` retornar erro.

Esse resultado será usado em mais de uma ação, por exemplo registrar uma entrada de auditoria e incrementar um contador de métricas. Para evitar repetir essas chamadas antes de cada `return`, a ideia é utilizar `defer`. A primeira implementação é a seguinte:

```go
const (
	ResultOK          = "ok"
	ResultFetchFailed = "fetch_failed"
	ResultSaveFailed  = "save_failed"
)

func syncCatalog() error {
	var result string
	defer audit(result)
	defer recordMetric(result)

	if err := fetchRemote(); err != nil {
		result = ResultFetchFailed
		return err
	}

	if err := saveLocal(); err != nil {
		result = ResultSaveFailed
		return err
	}

	result = ResultOK
	return nil
}
```

A variável `result` é declarada primeiro e, em seguida, as chamadas a `audit` e `recordMetric` são adiadas com `defer`. Ao longo da função, `result` é atualizada conforme o caminho de execução.

Ao executar esse código, observa-se que, independentemente do caminho seguido, `audit` e `recordMetric` sempre recebem o mesmo valor: uma string vazia.

### Por que o valor é sempre vazio

Os argumentos de uma chamada adiada com `defer` são determinados imediatamente, e não quando a função que a contém retorna. No exemplo, `audit(result)` e `recordMetric(result)` são registradas no momento em que a instrução `defer` é executada, e naquele ponto `result` ainda é uma string vazia. Esse valor é copiado e será o utilizado quando as chamadas adiadas forem executadas, mesmo que `result` seja alterada depois.

Há duas soluções principais para manter o uso de `defer`.

### Solução 1: passar um ponteiro

A primeira solução é passar um ponteiro para a string às funções adiadas:

```go
func syncCatalog() error {
	var result string
	defer audit(&result)
	defer recordMetric(&result)

	// O restante da função permanece igual
	if err := fetchRemote(); err != nil {
		result = ResultFetchFailed
		return err
	}

	if err := saveLocal(); err != nil {
		result = ResultSaveFailed
		return err
	}

	result = ResultOK
	return nil
}
```

A variável continua sendo atualizada conforme o caso, mas agora `audit` e `recordMetric` recebem `*string`. O argumento determinado imediatamente é o endereço de `result`. Embora o conteúdo de `result` mude ao longo da função, seu endereço permanece o mesmo. Assim, quando as funções adiadas forem executadas e lerem o valor referenciado pelo ponteiro, elas observarão o valor final.

A desvantagem dessa abordagem é que ela exige alterar a assinatura de `audit` e `recordMetric`, o que nem sempre é possível.

### Solução 2: usar uma closure

A segunda solução é adiar a chamada de uma closure. 

> Uma closure é um valor de função anônima que referencia variáveis declaradas fora do seu corpo. 

Os argumentos passados para a função adiada continuam sendo determinados imediatamente, mas as variáveis externas referenciadas dentro da closure têm o valor determinado apenas quando a closure é executada, isto é, quando a função que a contém retorna.

O exemplo a seguir ilustra a diferença. A closure usa duas variáveis: `x`, recebida como argumento, e `y`, referenciada a partir do escopo externo.

```go
func main() {
	x := 1
	y := 1

	defer func(x int) {
		fmt.Println(x, y)
	}(x)

	x = 10
	y = 20
}
```

O valor de `x` é passado como argumento da closure e, por isso, é determinado imediatamente, com valor `1`. Já `y` é uma variável externa ao corpo da closure e só é lida quando ela é executada, já com o valor `20`. A saída do programa é `1 20`. Note que o parâmetro `x` da closure oculta a variável `x` externa, e a atribuição `x = 10` não afeta o valor já copiado.

Aplicando essa técnica ao problema original:

```go
func syncCatalog() error {
	var result string
	defer func() {
		audit(result)
		recordMetric(result)
	}()

	// O restante da função permanece igual
}
```

As chamadas a `audit` e `recordMetric` foram colocadas dentro de uma closure que referencia `result` a partir do escopo externo. Como a closure não recebe argumentos, `result` é lida somente no momento em que ela é executada, ou seja, depois de todas as atribuições. Essa solução funciona sem exigir mudanças nas assinaturas das duas funções.

## Receivers com ponteiro e com valor

A mesma regra de determinação imediata se aplica quando `defer` é usado com um método: o receiver também é determinado no momento da instrução `defer`. O efeito prático depende de o receiver ser um valor ou um ponteiro.

### Receiver por valor

No exemplo a seguir, um método com receiver por valor é adiado e o receiver é modificado em seguida:

```go
type Account struct {
	owner string
}

func (a Account) show() {
	fmt.Println(a.owner)
}

func main() {
	a := Account{owner: "alice"}
	defer a.show()
	a.owner = "bob"
}
```

Ao executar `defer a.show()`, o receiver `a` é determinado imediatamente e uma cópia dele, com `owner` igual a `alice`, é associada à chamada adiada. A alteração posterior para `bob` ocorre apenas na variável original e não é visível para a cópia. Portanto, o programa imprime `alice`.

### Receiver por ponteiro

Se o receiver for um ponteiro, as alterações feitas após o `defer` são visíveis:

```go
type Account struct {
	owner string
}

func (a *Account) show() {
	fmt.Println(a.owner)
}

func main() {
	a := &Account{owner: "alice"}
	defer a.show()
	a.owner = "bob"
}
```

O receiver `a` também é determinado imediatamente, mas o valor determinado é o próprio ponteiro, que é copiado para a chamada adiada. Como a cópia do ponteiro continua referenciando a mesma struct, a alteração de `owner` feita depois do `defer` é observada quando `show` é executado. Portanto, o programa imprime `bob`.

## Resumo das regras

Os pontos a seguir sintetizam o comportamento descrito:

- Os argumentos de uma função ou método adiado com `defer` são determinados imediatamente.
- Para que a função adiada enxergue alterações feitas depois do `defer`, é possível passar um ponteiro como argumento ou adiar uma closure que referencie as variáveis externas.
- O receiver de um método adiado também é determinado imediatamente.
- Com receiver por valor, a chamada adiada opera sobre uma cópia feita no momento do `defer`. Com receiver por ponteiro, o ponteiro é copiado e as alterações na struct referenciada são visíveis.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.
