**Escopo de variável** é o espaço do código onde uma variável pode ser utilizada.

No Go, variáveis declaradas no nível de pacote podem ser usadas dentro de funções do mesmo pacote. Variáveis declaradas dentro de uma função podem ser usadas dentro de blocos de decisão (`if`) e de repetição (`for`).

Porém, uma variável de um escopo mais externo (como o nível de pacote ou função) **pode ser redeclarada em escopos internos, causando o sombreamento de variável**. Isso pode gerar confusão e *bugs*.

No exemplo abaixo, a variável `debugMode ` é redeclarada dentro da função com o operador de declaração curto (`:=`), criando uma nova variável local e não alterando a variável do pacote como esperado:

```go
package main

import "fmt"

var debugMode = false

func main() {
    fmt.Println(debugMode) // Print: false

    setDebugMode(true) // Espera-se alterar a variável global

    fmt.Println(debugMode) // Print: false (não alterada)
}

func setDebugMode(enable bool) {
    debugMode := enable   // SOMBREAMENTO
    fmt.Println(debugMode) // Print: true (variável local)
}
```

Outro caso é quando usamos o operador de declaração curto (`:=`) dentro de um bloco `if` com múltiplos retornos de uma função. No exemplo abaixo, a variável `foo` é redeclarada dentro do `if`, sombreando a variável do nível da função e deixando a variável original inalterada:

```go
package main

import "fmt"

func main() {
    foo := "foo"

    if len(foo) > 2 {
        foo, err := doSomething() // SOMBREAMENTO
        if err != nil {
            fmt.Println("Error:", err)
            return
        }
        fmt.Println("Inside if block:", foo) // Print: bar
    }

    fmt.Println("Outside if block:", foo) // Print: foo
}

func doSomething() (string, error) {
    return "bar", nil
}
```

Para evitar esse problema, a variável de erro deve ser declarada antes do retorno da função e o operador de atribuição simples `(=)` deve ser utilizado para modificar a variável existente, assim:

```go
package main

import "fmt"

func main() {
    foo := "foo"

    if len(foo) > 2 {
        var err error

        foo, err = doSomething() // NÃO SOMBREA
        if err != nil {
            fmt.Println("Error:", err)
            return
        }

        fmt.Println("Inside if block:", foo) // Print: "Inside if block: bar"
    }

    fmt.Println("Outside if block:", foo) // Print: "Outside if block: bar"
}

func doSomething() (string, error) {
    return "bar", nil
}
```

Em resumo, o sombreamento acontece quando uma variável é redeclarada em um escopo mais interno, escondendo a original. Para evitar erros, use o operador de atribuição (`=`) para atribuir valores a variáveis já declaradas e evite redeclarar variáveis com o mesmo nome em escopos próximos.
