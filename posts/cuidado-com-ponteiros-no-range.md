Ao trabalhar com loops em Go, especialmente usando `range`, existe um erro sutil que pode causar comportamentos inesperados quando lidamos com ponteiros.
## O cenário

Considere as seguintes estruturas:

```go
type Customer struct {
    ID      string
    Balance float64
}

type Store struct {
    m map[string]*Customer
}
```

Agora, imagine que queremos armazenar clientes em um mapa usando seus IDs como chave:

```go
func (s *Store) storeCustomers(customers []Customer) {
    for _, customer := range customers {
        s.m[customer.ID] = &customer
    }
}
```

Chamando essa função com:

```go
s.storeCustomers([]Customer{
    {ID: "1", Balance: 10},
    {ID: "2", Balance: -10},
    {ID: "3", Balance: 0},
})
```

Esperaríamos que o mapa tivesse três clientes diferentes, mas ao imprimir o resultado:

```go
key=1, value=&main.Customer{ID:"3", Balance:0}
key=2, value=&main.Customer{ID:"3", Balance:0}
key=3, value=&main.Customer{ID:"3", Balance:0}
```

Todos os valores apontam para o mesmo cliente. Por quê?

## Entendendo o problema

O erro está na forma como o `range` funciona em Go.

Quando usamos:

```go
for _, customer := range customers
```

a variável `customer` é reutilizada a cada iteração. Isso significa que ela ocupa sempre o mesmo endereço de memória.

Ou seja, todas as iterações usam o mesmo endereço.

### O que acontece na prática

Vamos detalhar:

- Na primeira iteração, `customer` contém o cliente 1  
- Na segunda, ele passa a conter o cliente 2  
- Na terceira, ele contém o cliente 3  

Mas o ponteiro armazenado no mapa sempre aponta para a mesma variável `customer`, que ao final do loop contém o último valor atribuído.

> Resultado: todos os ponteiros apontam para o último elemento.

## Como corrigir

Existem duas formas principais de resolver esse problema.

### Solução 1: criar uma variável local

```go
func (s *Store) storeCustomers(customers []Customer) {
    for _, customer := range customers {
        current := customer
        s.m[current.ID] = &current
    }
}
```

Aqui, `current` é uma nova variável criada a cada iteração. Cada uma tem seu próprio endereço de memória.

Assim, cada ponteiro armazenado no mapa aponta para um cliente diferente.

### Solução 2: usar o índice do slice

```go
func (s *Store) storeCustomers(customers []Customer) {
    for i := range customers {
        customer := &customers[i]
        s.m[customer.ID] = customer
    }
}
```

Nesse caso, acessamos diretamente o elemento do slice pelo índice, garantindo que cada ponteiro seja único e aponte para a posição correta no slice.


Sempre que precisar trabalhar com ponteiros dentro de um `range`, lembre-se:

- Nunca armazene diretamente o endereço da variável do loop  
- Prefira criar uma variável local ou usar o índice do slice  

Entender esse detalhe ajuda a evitar bugs difíceis de identificar e torna seu código mais confiável.

**Referência**: HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.