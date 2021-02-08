import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public/constants';
import { OpenConversationRequest } from '../public/interfaces';
import { Communication } from '../internal/communication';
import { Handlers } from '../internal/handlers';

/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
export namespace conversations {
  /**
   * @private
   * Hide from docs
   * --------------
   * Allows the user to start or continue a conversation with each subentity inside the tab
   */
  export function openConversation(openConversationRequest: OpenConversationRequest): void {
    ensureInitialized(FrameContexts.content);
    Communication.sendMessageToParent(
      'conversations.openConversation',
      [
        {
          title: openConversationRequest.title,
          subEntityId: openConversationRequest.subEntityId,
          conversationId: openConversationRequest.conversationId,
          channelId: openConversationRequest.channelId,
          entityId: openConversationRequest.entityId,
        },
      ],
      (status: boolean, reason: string) => {
        if (!status) {
          throw new Error(reason);
        }
      },
    );
    if (openConversationRequest.onStartConversation) {
      Handlers.registerHandler(
        'startConversation',
        (subEntityId: string, conversationId: string, channelId: string, entityId: string) =>
          openConversationRequest.onStartConversation({
            subEntityId,
            conversationId,
            channelId,
            entityId,
          }),
      );
    }
    if (openConversationRequest.onCloseConversation) {
      Handlers.registerHandler(
        'closeConversation',
        (subEntityId: string, conversationId?: string, channelId?: string, entityId?: string) =>
          openConversationRequest.onCloseConversation({
            subEntityId,
            conversationId,
            channelId,
            entityId,
          }),
      );
    }
  }

  /**
   * @private
   * Hide from docs
   * --------------
   * Allows the user to close the conversation in the right pane
   */
  export function closeConversation(): void {
    ensureInitialized(FrameContexts.content);
    Communication.sendMessageToParent('conversations.closeConversation');
    Handlers.removeHandler('startConversation');
    Handlers.removeHandler('closeConversation');
  }
}
