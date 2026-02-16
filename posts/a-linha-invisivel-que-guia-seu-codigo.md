Um modelo mental, no contexto de *software*, é a representação interna que um desenvolvedor constrói para compreender como um sistema ou trecho de código funciona. Ele não é visível, mas sim uma estrutura de raciocínio que permite prever o comportamento do sistema com base no conhecimento adquirido até aquele momento.

Durante a leitura ou escrita de código, o desenvolvedor precisa manter esse modelo atualizado para entender, por exemplo, quais funções interagem entre si, como os dados fluem e quais efeitos colaterais podem ocorrer.

Códigos com boa legibilidade exigem menos esforço cognitivo para manter esses modelos mentais coerentes e atualizados.

Um dos fatores que contribuem para uma boa legibilidade é o alinhamento do código.

Na *Golang UK Conference* de 2016, [Mat Ryer apresentou o conceito de *line of sight in code*](https://www.youtube.com/watch?v=yeetIgNeIkc) (“linha de visão no código”, em tradução literal). Ele define linha de visão como “uma linha reta ao longo da qual um observador tem visão desobstruída”.

Aplicado ao código, isso significa que uma boa linha de visão não altera o comportamento da função, mas torna mais fácil para outras pessoas entenderem o que está acontecendo. 

A ideia é que o leitor consiga acompanhar o fluxo principal de execução olhando para uma única coluna, sem precisar pular entre blocos, interpretar condições ou navegar por estruturas aninhadas.

Uma boa prática é alinhar o caminho feliz da função à esquerda do código. Isso facilita a visualização imediata do fluxo esperado.

O caminho feliz é o fluxo principal de execução de uma função ou sistema, em que tudo ocorre como esperado sem erros, exceções ou desvios.

Na imagem a seguir é possível visualizar um exemplo de caminho feliz:

![Exemplo de caminho feliz](/assets/img/posts/exemplo-caminho-feliz.png)

De modo geral, quanto mais níveis de aninhamento uma função possui, mais difícil ela se torna de ler e entender, além de ocultar o caminho feliz, como podemos ver na imagem abaixo:

```go
func process(user *User) error {
    if user != nil {
        if user.IsActive {
            if err := save(user); err == nil {
                fmt.Println("User processed successfully")
            } else {
                return err
            }
        } else {
            return errors.New("user is not active")
        }
    } else {
        return errors.New("user is nil")
    }
    return nil
}
```

Mat Ryer em seu artigo [Code: Align the happy path to the left edge](https://medium.com/@matryer/line-of-sight-in-code-186dd7cdea88) apresenta mais dicas para uma boa linha de visão, sendo elas:

**Retorne o mais cedo possível de uma função**. Essa prática melhora a legibilidade porque reduz o aninhamento e mantém o caminho feliz limpo e direto.

```go
// Sem retorno antecipado
func processOrder(order *Order) error {
    if order != nil {
        if order.IsPaid {
            fmt.Println("Order is being processed")
            return nil
        } else {
            return errors.New("order is not paid")
        }
    } else {
        return errors.New("order is nil")
    }
}

// Com retorno antecipado
func processOrder(order *Order) error {
    if order == nil {
        return errors.New("order is nil")
    }

    if !order.IsPaid {
        return errors.New("order is not paid")
    }

    fmt.Println("Order is being processed")
    return nil
}
```

**Evite usar `else `para retornar valores, especialmente quando o `if `já retorna algo**. Em vez disso, inverta a condição `if` (*flip the if*) e retorne mais cedo, deixando o fluxo principal fora do `else`.

```go
// Com retorno no else
func authorize(user *User) error {
    if user.IsAdmin {
        return nil
    } else {
        return errors.New("user is not authorized")
    }
}

// Com o if invertido retornando
func authorize(user *User) error {
    if !user.IsAdmin {
        return errors.New("user is not authorized")
    }

    return nil
}
```

**Coloque o retorno do caminho feliz (o sucesso) como a última linha da função**. Isso ajuda a deixar o fluxo principal claro e previsível. Quem lê sabe que, se nada der errado, o sucesso acontece no final.

```go
// Retornando sucesso dentro do if
func save(user *User) error {
    if user == nil {
        return errors.New("user is nil")
    }

    if user.IsActive {
        return nil
    }

    return errors.New("user is not active")
}

// Retornando sucesso no final
func save(user *User) error {
    if user == nil {
        return errors.New("user is nil")
    }

    if !user.IsActive {
        return errors.New("user is not active")
    }

    return nil
}
```

**Separe partes da lógica em funções auxiliares para que as funções principais fiquem curtas, claras e fáceis de entender.** Funções muito longas e cheias de detalhes dificultam a leitura e a manutenção.

```go
// Função principal longa
func registerUser(user *User) error {
    if user.Email == "" || user.Password == "" {
        return errors.New("email or password is empty")
    }

    if !strings.Contains(user.Email, "@") {
        return errors.New("invalid email format")
    }

    hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
    if err != nil {
        return err
    }

    user.Password = string(hashed)

    if err := saveToDatabase(user); err != nil {
        return err
    }

    sendWelcomeEmail(user.Email)
    return nil
}

// Função principal curta
func registerUser(user *User) error {
    if err := validateUser(user); err != nil {
        return err
    }

    if err := hashPassword(user); err != nil {
        return err
    }

    if err := saveToDatabase(user); err != nil {
        return err
    }

    sendWelcomeEmail(user.Email)
    return nil
}

func validateUser(user *User) error {
    if user.Email == "" || user.Password == "" {
        return errors.New("email or password is empty")
    }
    if !strings.Contains(user.Email, "@") {
        return errors.New("invalid email format")
    }
    return nil
}

func hashPassword(user *User) error {
    hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
    if err != nil {
        return err
    }
    user.Password = string(hashed)
    return nil
}
```

**Se você tem blocos de código muito grandes e indentados (por exemplo, dentro de um `if`, `for` ou `switch`), considere extrair esse bloco para uma nova função.** Isso ajuda a manter a função principal mais plana, legível e fácil de seguir, evitando profundidade excessiva e “efeito escada” no código.

```go
// Bloco longo identado
func processPayment(p Payment) error {
    if p.IsValid {
        log.Println("Starting payment processing...")
        result, err := callPaymentGateway(p)
        if err != nil {
            return err
        }

        if result.IsSuccess {
            log.Println("Payment succeeded")
            notifyUser(p.UserID)
        } else {
            return errors.New("payment failed")
        }
    } else {
        return errors.New("invalid payment")
    }

    return nil
}

// Refatorado
func processPayment(p Payment) error {
    if !p.IsValid {
        return errors.New("invalid payment")
    }

    return handleValidPayment(p)
}

func handleValidPayment(p Payment) error {
    log.Println("Starting payment processing...")

    result, err := callPaymentGateway(p)
    if err != nil {
        return err
    }

    if !result.IsSuccess {
        return errors.New("payment failed")
    }

    log.Println("Payment succeeded")
    notifyUser(p.UserID)
    return nil
}
```

Em resumo, cuidar da legibilidade do código é essencial para manter modelos mentais claros. Práticas como alinhar o caminho feliz, evitar aninhamentos profundos e extrair funções tornam o código mais fácil de entender, manter e evoluir.

**Referências**:

HARSANYI, Teiva. **100 Go mistakes and how to avoid them**. Shelter Island: Manning, 2022.

RYER, Mat. **Code: Align the happy path to the left edge**. 2016. Disponível em: https://medium.com/@matryer/line-of-sight-in-code-186dd7cdea88. Acesso em: 05 jul. 2025.
